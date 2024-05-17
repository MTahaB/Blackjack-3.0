import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Web3 from "web3";
import { StyledBtn, StyledLink } from "../components/App/App.styled";
import {
  InputWrapper,
  Input,
  Label,
  Form,
} from "../components/Manager/Manager.styled";
import { Overflow } from "../components/Manager/Manager.styled";

const Signup = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, watch } = useForm();
  const [web3, setWeb3] = useState(null);
  const [ethereumId, setEthereumId] = useState("");

  axios.defaults.withCredentials = true;

  const onSubmit = data => {
    axios.post("http://localhost:5000/auth/signup", data)
      .then(response => {
        if (response.data.status) {
          navigate("/login");
        }
      })
      .catch(err => {
        console.error(err);
        alert("An error occurred. Please try again later.");
      });
  };

  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        const accounts = await web3Instance.eth.getAccounts();
        setEthereumId(accounts[0]); 
        setValue("ethereumId", accounts[0]); // Synchronize form state
        console.log("Connected", accounts[0]);
      } catch (error) {
        console.error("User denied account access: ", error);
        alert("Connection to MetaMask failed.");
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  return (
    <Overflow className="active">
      <Form onSubmit={handleSubmit(onSubmit)}>
        <h2>Sign Up</h2>

        <InputWrapper>
          <Input
            type="text"
            autoComplete="off"
            className={`${watch("username") ? "filled" : ""}`}
            {...register("username", {
              required: "Username is required",
            })}
          />
          <Label htmlFor="username">Username</Label>
        </InputWrapper>

        <InputWrapper>
          <Input
            type="email"
            autoComplete="off"
            className={`${watch("email") ? "filled" : ""}`}
            {...register("email", {
              required: "Email is required",
            })}
          />
          <Label htmlFor="email">Email</Label>
        </InputWrapper>

        <InputWrapper>
          <Input
            type="password"
            className={`${watch("password") ? "filled" : ""}`}
            {...register("password", {
              required: "Password is required",
            })}
          />
          <Label htmlFor="password">Password</Label>
        </InputWrapper>

        <InputWrapper>
          <Input
            type="text"
            className={`${watch("ethereumId") ? "filled" : ""}`}
            {...register("ethereumId", {
              required: "Ethereum Id is required",
            })}
            value={ethereumId}
            onChange={(e) => setEthereumId(e.target.value)}
          />
          <Label htmlFor="ethereumId">Ethereum ID</Label>
        </InputWrapper>

        <StyledBtn type="button" onClick={connectMetaMask}>
          Connect MetaMask
        </StyledBtn>
        <StyledBtn type="submit">Sign Up</StyledBtn>
        <p style={{ marginLeft: "22vmin" }}>Have an account?</p>
        <StyledLink to="/login">Login</StyledLink>
      </Form>
    </Overflow>
  );
};

export default Signup;
