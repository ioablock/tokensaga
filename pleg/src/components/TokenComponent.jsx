import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import artifacts from "../utils/DevToken.json";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createAlchemyWeb3 } from "@alch/alchemy-web3";

const CONTRACT_ADDRESS = "0xd15d342122A1Bf0d2caEC85205f3B065FBc3F19F";

function TokenComponent({ connectedWallet }) {
  const [contract, setContract] = useState(undefined);
  const [web3, setWeb3] = useState(undefined);

  let [staking, setStaking] = useState(0);

  const [loading, setLoading] = useState(false);

  // helper
  const toEther = (wei) => ethers.utils.formatEther(wei);

  useEffect(() => {
    const getAssets = async (connectedWallet) => {
      const alchemyKey =
        "wss://polygon-mumbai.g.alchemy.com/v2/IM5L7pATeDXWhQjf9rkgvMND2HaO696p";
      const web3 = createAlchemyWeb3(alchemyKey);

      //load our smart contract using the Alchemy Web3 API that we initialized at the top of our file.
      const contract = await new web3.eth.Contract(
        artifacts.abi,
        CONTRACT_ADDRESS
      );

      if (staking == 0) {
        setWeb3(web3);
        setContract(contract);
      }
    };

    getAssets(connectedWallet);
  }, [loading]);

  /*  useEffect(() => {
    const onIssueTokenComplete = () => {
      //To trigger the rendering of the app
      setLoading(false);
    };*/

  /*if (contract) {
      contract.events.IssueTokenComplete().on("data", onIssueTokenComplete);
    }*/
  /*
   * Makes sure to clean up event when this component is removed
   */
  /* return () => {
      if (contract) {
        contract.events
          .IssueTokenComplete()
          .off("IssueTokenComplete", onIssueTokenComplete);
      }
    };*/
  // }, [contract]);

  const issueToken = async () => {
    try {
      const transactionParameters = {
        //specifies the  smart contract staking address
        to: CONTRACT_ADDRESS,
        from: connectedWallet,
        data: contract.methods.issueToken(connectedWallet).encodeABI(),
      };

      web3.eth
        .sendTransaction(transactionParameters)
        .on("transactionHash", (hash) => {
          console.log("txnHash", hash);
          toast.info(
            "You are creating 5 Token SAGA tokens (TKNSAGA) ! Mining..."
          );
          setLoading(true);
        });
      // }
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  return (
    <div>
      <div id="appBody">
        <div className="centerMarketContainer">
          <div className="subContainer">
            <span className="marketHeader">
              Create the Token Saga (TKNSAGA) ERC-20 token
            </span>
          </div>
          <div className="row">
            <div className="optionData">Mint 5 Token Saga tokens </div>
            <div className="optionMore">
              After the transaction is completed, <br />
              Add Your ERC20 Token to your MetaMask wallet
              <br />
              1. Make sure to be on the Mumbai Testnet
              <br />
              2. Scroll to the bottom of the MetaMask, under TOKENS
              <br />
              3. Click on “Import Tokens”
              <br />
              4. Paste the token Address:
              0xd15d342122A1Bf0d2caEC85205f3B065FBc3F19F
              <br />
              5. Click on “Add Custom Token”: the TKNSAGA token will appear in
              your wallet
              <br />
              <br />
            </div>
          </div>

          <div className="row">
            <br />
          </div>
          <div className="row">
            <div className="col-md-6">
              <div onClick={() => issueToken()} className="stakeButton">
                Issue 5 Token Saga tokens into my wallet
              </div>
            </div>
            <div className="col-md-6"></div>
          </div>
        </div>
      </div>

      <div></div>
    </div>
  );
}

export default TokenComponent;
