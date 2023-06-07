import { useContext, useEffect, useState } from "react";
import { Card } from "../../components/Card";
import copy from "copy-to-clipboard";
import DevnetAccountSelector from "../../components/DevnetAccountSelector";
import DevnetSelector from "../../components/DevnetSelector";
import "./styles.css";
import { DevnetContext } from "../../contexts/DevnetContext";
import { ConnectionContext } from "../../contexts/ConnectionContext";
import { StarknetWindowObject, connect, disconnect } from "get-starknet";
import Tooltip from "../../ui_components/Tooltip";
import { BsQuestionSquare } from "react-icons/bs";
import * as T from "../../ui_components/Tabs";
import * as D from "../../ui_components/Dialog";
import Container from "../../components/Container";

const trimAddress = (adr: string) => {
  if (adr && adr.startsWith("0x")) {
    const len = adr.length;
    return `${adr.slice(0, 6)}...${adr.slice(len - 6, len)}`;
  }
  return adr;
};

const makeVoyagerLink = async (starknetObj?: StarknetWindowObject | null) => {
  if (starknetObj) {
    const chainId = await starknetObj?.account?.getChainId();
    if (chainId === "0x534e5f474f45524c49") {
      return `https://goerli.voyager.online/contract/${starknetObj?.account?.address}`;
    } else {
      return `https://voyager.online/contract/${starknetObj?.account?.address}`;
    }
  }
  return "https://voyager.online";
};

interface ConnectionProps {}

function WalletAccountInfo() {
  const { starknetWindowObject, setStarknetWindowObject } =
    useContext(ConnectionContext);

  async function refreshWalletHandler() {
    disconnect({ clearLastWallet: true });
    setStarknetWindowObject(
      await connect({ modalMode: "alwaysAsk", modalTheme: "system" })
    );
  }

  const [showCopied, setCopied] = useState(false);

  const [voyagerLink, setVoyagerLink] = useState("");

  useEffect(() => {
    (async () => {
      const link = await makeVoyagerLink(starknetWindowObject);
      setVoyagerLink(link);
    })();
  }, [starknetWindowObject]);

  return (
    <div
      className="flex"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      <button
        className="btn btn-primary mt-2 mb-2"
        onClick={refreshWalletHandler}
      >
        Reconnect
      </button>
      <div className="wallet-wrapper">
        <img src={starknetWindowObject?.icon} alt="wallet icon" />
        <p className="text"> {starknetWindowObject?.id}</p>
        <Tooltip
          icon={<BsQuestionSquare />}
          content={`${starknetWindowObject?.id} doesn't support cairo 1 contracts`}
        />
      </div>
      <div className="account-wrapper">
        <span>
          <p
            className="text account"
            title={starknetWindowObject?.account?.address}
          >
            {trimAddress(starknetWindowObject?.account?.address || "")}
          </p>
          <button
            className="btn"
            onClick={() => {
              copy(starknetWindowObject?.account?.address || "");
              setCopied(true);
              setTimeout(() => {
                setCopied(false);
              }, 1000);
            }}
          >
            <svg
              stroke="currentColor"
              fill="none"
              stroke-width="2"
              viewBox="0 0 24 24"
              stroke-linecap="round"
              stroke-linejoin="round"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
          {showCopied && <p>Copied</p>}
        </span>
        <a href={voyagerLink} target="_blank" rel="noopnener noreferer">
          View on Voyager
        </a>
      </div>
    </div>
  );
}

function Devnet(_: ConnectionProps) {
  const { devnetEnv } = useContext(DevnetContext);
  return (
    <div className="starknet-connection-component mb-8">
      <T.Root defaultValue="environment">
        <T.List>
          <T.Trigger value="environment">Environment</T.Trigger>
          <T.Trigger value="cairo1">Cairo 1 Acc.</T.Trigger>
        </T.List>
        <T.Content value="environment">
          <div className="flex">
            <label className="">Environment selection</label>
            <DevnetSelector />
          </div>
          <div className="flex">
            {devnetEnv ? <DevnetAccountSelector /> : <WalletAccountInfo />}
          </div>
        </T.Content>
        <T.Content value="cairo1">
          <h6>Create a New Cairo 1 Account</h6>
          <D.Root>
            <D.Trigger>
              <button className="btn btn-primary">Create New</button>
            </D.Trigger>
            <D.Content asChild>
              <D.Close asChild />
              Steps to make + Fund account goes here
            </D.Content>
          </D.Root>
        </T.Content>
      </T.Root>
    </div>
  );
}

export { Devnet };
