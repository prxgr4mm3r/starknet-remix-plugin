import React, { useContext, useState } from 'react'
import { Card } from '../../components/Card'
import DevnetAccountSelector from '../../components/DevnetAccountSelector'
import './styles.css'
import './styles.css'
import {
  type ConnectOptions,
  type DisconnectOptions,
  type StarknetWindowObject,
  connect,
  disconnect
} from 'get-starknet'
import { RemixClientContext } from '../../contexts/RemixClientContext'
import { type Devnet, devnets } from '../../utils/network'
import EnvironmentSelector from '../../components/EnvironmentSelector'
import { ConnectionContext } from '../../contexts/ConnectionContext'
import Wallet from '../../components/Wallet'
import NewTestNetAccount from '../../components/NewTestnetAccount'
import { EnvCard } from '../../components/EnvCard'
import ManualAccount from '../../components/ManualAccount'

interface ConnectionProps {}

const Environment: React.FC<ConnectionProps> = () => {
  const remixClient = useContext(RemixClientContext)
  const { setAccount, setProvider } = useContext(ConnectionContext)

  // START: DEVNET
  const [devnet, setDevnet] = useState<Devnet>(devnets[0])
  const [env, setEnv] = useState<string>('devnet')
  // END: DEVNET

  // START: WALLET
  const [starknetWindowObject, setStarknetWindowObject] =
    useState<StarknetWindowObject | null>(null)

  const connectWalletHandler = async (
    options: ConnectOptions = {
      modalMode: 'alwaysAsk',
      modalTheme: 'dark'
    }
  ) => {
    try {
      const connectedStarknetWindowObject = await connect(options)
      if (connectedStarknetWindowObject == null) {
        throw new Error('Failed to connect to wallet')
      }
      await connectedStarknetWindowObject.enable({ starknetVersion: 'v4' })
      connectedStarknetWindowObject.on(
        'accountsChanged',
        (accounts: string[]) => {
          console.log('accountsChanged', accounts)
          connectWalletHandler({
            modalMode: 'neverAsk',
            modalTheme: 'dark'
          })
          connectedStarknetWindowObject.off(
            'accountsChanged',
            (_accounts: string[]) => {}
          )
        }
      )

      connectedStarknetWindowObject.on('networkChanged', (network?: string) => {
        console.log('networkChanged', network)
        connectWalletHandler({
          modalMode: 'neverAsk',
          modalTheme: 'dark'
        })
        connectedStarknetWindowObject.off(
          'networkChanged',
          (_network?: string) => {}
        )
      })
      setStarknetWindowObject(connectedStarknetWindowObject)
      if (connectedStarknetWindowObject.account != null) {
        setAccount(connectedStarknetWindowObject.account)
      }
      if (connectedStarknetWindowObject.provider != null) {
        setProvider(connectedStarknetWindowObject.provider)
      }
    } catch (e) {
      if (e instanceof Error) {
        await remixClient.call('notification' as any, 'error', e.message)
      }
      console.log(e)
    }
  }

  const disconnectWalletHandler = async (
    options: DisconnectOptions = {
      clearLastWallet: true
    }
  ) => {
    if (starknetWindowObject != null) {
      starknetWindowObject.off('accountsChanged', (_accounts: string[]) => {})
      starknetWindowObject.off('networkChanged', (_network?: string) => {})
    }
    await disconnect(options)
    setStarknetWindowObject(null)
    setAccount(null)
    setProvider(null)
  }

  // END: WALLET
  const [dialogState, setDialogState] = useState(false)

  return (
    <div className="starknet-connection-component mb-8">
      <NewTestNetAccount state={[dialogState, setDialogState]} />

      <EnvCard
        header="Environment"
        setEnv={setEnv}
        disconnectWalletHandler={disconnectWalletHandler}
      >
        {env === 'manual' ? (
          <ManualAccount />
        ) : (
          <>
            <div className="flex">
              <label className="">Environment selection</label>
              <EnvironmentSelector
                env={env}
                setEnv={setEnv}
                devnet={devnet}
                setDevnet={setDevnet}
                connectWalletHandler={connectWalletHandler}
                disconnectWalletHandler={disconnectWalletHandler}
              />
            </div>
            <div className="flex">
              {env === 'devnet' ? (
                <DevnetAccountSelector devnet={devnet} />
              ) : (
                <Wallet
                  starknetWindowObject={starknetWindowObject}
                  connectWalletHandler={connectWalletHandler}
                  disconnectWalletHandler={disconnectWalletHandler}
                />
              )}
            </div>
          </>
        )}
      </EnvCard>
    </div>
  )
}

export { Environment }
