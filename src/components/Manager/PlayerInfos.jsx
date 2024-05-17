import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import Web3 from "web3";
import {
  CheckboxInputWrapper,
  CheckboxLabel,
  InputWrapper,
  CheckboxInput,
  ErrorMsg,
  Input,
  Label,
  Form,
} from "./Manager.styled";
import { StyledBtn } from "../App/App.styled";
import { SocketEmit, SocketOn, Socket } from "../../assets/constants";
import { game } from "../../game-elements/game";
import contractABI from "../../../../blockchain/build/contracts/JeuBlackjack.json";

const contractAddress = contractABI.networks[1715290952044].address;

export const PlayerInfos = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    setError,
  } = useForm();
  const [disabled, setDisabled] = useState(false);
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const [tokenAmount, setTokenAmount] = useState("");
  const web3 = new Web3(window.ethereum);

  const buyTokens = async () => {
    if (!tokenAmount) {
      alert("Please enter the amount of tokens you want to buy.");
      return;
    }

    try {
      const contract = new web3.eth.Contract(contractABI.abi, contractAddress);
      const accounts = await web3.eth.getAccounts();
      const amountInWei = web3.utils.toWei(tokenAmount, "ether");
      const tokenbought = amountInWei * 2500 / 1e18;
      const response = await contract.methods.buyTokens(tokenbought).send({
        from: accounts[0],
        value: amountInWei,
        gasPrice: web3.utils.toWei("10", "gwei"),
      });
      
      console.log("Tokens bought:", response);
      alert("Tokens purchased successfully!, you bought " + tokenbought + " tokens.");
    } catch (error) {
      console.error("Error buying tokens:", error);
      alert("Failed to buy tokens. Check console for details.");
    }
  };

  useEffect(() => {
    register("tokenAmount");
  }, [register]);

  const onJoinTable = useCallback((name, balance, id) => {
    id
      ? game.emit[SocketEmit.JoinTable](id, name, balance)
      : game.emit[SocketEmit.CreateTable](name, balance);
  }, []);

  const onSubmit = useCallback(
    (data) => {
      setDisabled(true);
      const { joinExistingTable, tableId } = data;
      if (joinExistingTable && !tableId) {
        return;
      }
      onJoinTable(
        userData.username,
        userData.balance,
        joinExistingTable ? tableId : undefined
      );
    },
    [onJoinTable, userData]
  );

  useEffect(() => {
    axios
      .get("http://localhost:5000/auth/user", { withCredentials: true })
      .then((response) => {
        setUserData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching user data", error);
      });

    const handleTableCreated = (table, player) => {
      game.onTableCreated(JSON.parse(table), JSON.parse(player));
      if (game.table && game.player) {
        navigate(`/table?id=${game.table.id}`);
      }
      game.modalUpdate(true);
    };

    const handleError = () => {
      setDisabled(false);
      setError("tableId", { message: "Invalid table ID" });
      const tableIdInput = document.querySelector('input[name="tableId"]');
      if (tableIdInput) {
        tableIdInput.value = "";
      }
    };

    Socket.on(SocketOn.TableCreated, handleTableCreated);
    Socket.on(SocketOn.Error, handleError);

    return () => {
      Socket.off(SocketOn.TableCreated, handleTableCreated);
      Socket.off(SocketOn.Error, handleError);
    };
  }, [navigate, setError, onJoinTable]);

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <InputWrapper>
        <Input
          type="text"
          placeholder="Enter token amount"
          value={tokenAmount}
          onChange={(e) => {
            setTokenAmount(e.target.value);
            setValue("tokenAmount", e.target.value); // Ensure it syncs with React Hook Form
          }}
        />
        <Label>Token Amount</Label>
      </InputWrapper>
      <StyledBtn
        type="button"
        onClick={buyTokens}
        disabled={!tokenAmount || disabled}
      >
        Buy Tokens
      </StyledBtn>
      <CheckboxInputWrapper>
        <CheckboxInput
          id="checkbox"
          type="checkbox"
          className="checkbox-input"
          {...register("joinExistingTable")}
        />
        <label className="fake-check" htmlFor="checkbox"></label>
        <CheckboxLabel>Join table</CheckboxLabel>
      </CheckboxInputWrapper>
      {watch("joinExistingTable") && (
        <InputWrapper>
          {errors.tableId && <ErrorMsg>{errors.tableId.message}</ErrorMsg>}
          <Input
            autoComplete="off"
            className={`${watch("tableId") ? "filled" : ""}`}
            type="text"
            {...register("tableId", {
              required: "Table ID is required",
            })}
          />
          <Label>Table id:</Label>
        </InputWrapper>
      )}
      <StyledBtn
        type="submit"
        className="button buttonBlue"
        disabled={disabled}
      >
        {watch("joinExistingTable") ? "Join table" : "Create a new table"}
      </StyledBtn>
    </Form>
  );
};

export default PlayerInfos;