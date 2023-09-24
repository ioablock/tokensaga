import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import artifacts from "../utils/Staking.json";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createAlchemyWeb3 } from "@alch/alchemy-web3";

const CONTRACT_ADDRESS = "0x6adc93f89b210b8f50c8e97f7b1fb3d260934261";

function StakingComponent({ connectedWallet }) {
  const [contract, setContract] = useState(undefined);
  const [web3, setWeb3] = useState(undefined);

  // assets
  let [assetIds, setAssetIds] = useState([]);
  // our positions
  let [assets, setAssets] = useState([]);
  // to know when to re-render the Staked Assets List
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

      const assetIds = await contract.methods
        .getPositionIdsForAddress(connectedWallet)
        .call();
      setAssetIds(assetIds);

      const queriedAssets = await Promise.all(
        assetIds.map((id) => contract.methods.getPositionById(id).call())
      );

      let myAssets = [];
      queriedAssets.map(async (asset) => {
        var date = new Date(asset.createdDate * 1000);
        let formattedCreationStakingDate =
          "" +
          date.getDate() +
          "/" +
          (date.getMonth() + 1) +
          "/" +
          date.getFullYear() +
          " " +
          date.getHours() +
          ":" +
          date.getMinutes() +
          ":" +
          date.getSeconds();

        const parsedAsset = {
          positionId: asset.positionId,
          percentInterest: Number(asset.percentInterest) / 100,
          createdDate: formattedCreationStakingDate,
          plegInterest: toEther(asset.plegInterest),
          plegStaked: toEther(asset.plegWeiStaked),
          open: asset.open,
          flexible: asset.flexible,
          earnedInterest: toEther(asset.earnedInterest),
        };

        myAssets = [...myAssets, parsedAsset];
      });

      setAssets(myAssets);
    };

    getAssets(connectedWallet);
  }, [loading]);

  useEffect(() => {
    const onStakeComplete = () => {
      //To trigger the rendering of the app
      setLoading(false);
    };

    const onWithdrawComplete = () => {
      //To trigger the rendering of the app
      setLoading(false);
    };

    if (contract) {
      contract.events.StakeComplete().on("data", onStakeComplete);
      contract.events.WithdrawComplete().on("data", onWithdrawComplete);
    }
    /*
     * Makes sure to clean up event when this component is removed
     */
    return () => {
      if (contract) {
        contract.events.StakeComplete().off("StakeComplete", onStakeComplete);
        contract.events
          .WithdrawComplete()
          .off("WithdrawComplete", onWithdrawComplete);
      }
    };
  }, [contract]);

  const stakePleg = async (flexible) => {
    try {
      // Check if the user can stake, because the user can only stake once
      let canStake = false;
      if (flexible == false) {
        canStake = await contract.methods.canClaimFixed(connectedWallet).call();
      } else {
        canStake = await contract.methods.canClaimFlex(connectedWallet).call();
      }

      if (canStake == false && flexible == false) {
        toast.error("You have already done a fixed staking");
        return;
      }
      if (canStake == false && flexible == true) {
        toast.error("You have already done a flex staking");
        return;
      }
      if (canStake == true) {
        let maticAmount = web3.utils.toHex(web3.utils.toWei("0.06", "ether"));

        const transactionParameters = {
          //specifies the  smart contract staking address
          to: CONTRACT_ADDRESS,
          from: connectedWallet,
          value: maticAmount,
          data: contract.methods.stakePleg(flexible).encodeABI(),
        };

        web3.eth
          .sendTransaction(transactionParameters)
          .on("transactionHash", (hash) => {
            console.log("txnHash", hash);
            toast.info("You just staked 0.06 MATIC ! Mining...");
            setLoading(true);
          });
      }
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const withdraw = (positionId) => {
    try {
      const transactionParameters = {
        //specifies the  smart contract staking address
        to: CONTRACT_ADDRESS,
        from: connectedWallet,

        data: contract.methods.closePosition(positionId).encodeABI(),
      };

      web3.eth
        .sendTransaction(transactionParameters)
        .on("transactionHash", (hash) => {
          console.log("txnHash", hash);
          toast.info("You are withdrawing your funds ! Mining...");
          setLoading(true);
        });
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
              MATIC 10 minutes staking market
            </span>
          </div>
          <div className="row">
            <div className="optionData">Fixed Staking </div>
            <div className="optionMore">
              User locks funds for 10 minutes to get 100% interest. If early
              withdrawal, there will be no earned interest.
            </div>
          </div>
          <div className="row">
            <div className="optionData">Flexible Staking</div>
            <div className="optionMore">
              User deposits funds to get a maximum of 50% interest over 10
              minutes. Possibility to withdraw early and receive the accrued
              interest quota.
            </div>
          </div>
          <div className="row">
            <br />
          </div>
          <div className="row">
            <div className="col-md-6">
              <div onClick={() => stakePleg(false)} className="stakeButton">
                Fixed Stake 0.06 MATIC - 100% APY
              </div>
            </div>
            <div className="col-md-6">
              <div onClick={() => stakePleg(true)} className="stakeButton">
                Flex Stake 0.06 MATIC - 50% APY
              </div>
            </div>
          </div>
        </div>
      </div>

      {assets.length > 0 && (
        <div className="assetContainer">
          <div className="subContainer">
            <span className="marketHeader">Staked Assets</span>
          </div>
          <div>
            <div className="row columnHeaders">
              <div className="col-md-2">Type</div>
              <div className="col-md-1">APY</div>
              <div className="col-md-2">Staked Matic</div>
              <div className="col-md-3"> &nbsp; Date</div>
              <div className="col-md-2">Earned interest</div>
              <div className="col-md-2"></div>
            </div>
          </div>
          <br />
          {assets.length > 0 &&
            assets.map((a) => (
              <div className="row" key={a.positionId}>
                <div className="col-md-2">
                  {a.flexible == false ? "Fixed" : "Flexible"}
                </div>
                <div className="col-md-1">{a.percentInterest} </div>
                <div className="col-md-2">{a.plegStaked}</div>
                <div className="col-md-3">{a.createdDate}</div>
                <div className="col-md-2">{a.earnedInterest}</div>

                <div className="col-md-2">
                  {a.open ? (
                    <div
                      onClick={() => withdraw(a.positionId)}
                      className="orangeMiniButton"
                    >
                      Withdraw
                    </div>
                  ) : (
                    <span>closed</span>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
      <div></div>
    </div>
  );
}

export default StakingComponent;
