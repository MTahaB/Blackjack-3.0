import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { StyledBtn, StyledLink } from "../components/App/App.styled";
import { Overflow, StyledDiv } from "../components/Manager/Manager.styled";
import { logout } from "../game-elements/utils";
import Web3 from "web3";
import casinoABI from "../../../blockchain/build/contracts/JetonCasino.json";

const casinoAddress = casinoABI.networks[1715290952044].address; 

const Home = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/auth/verify")
      .then((res) => {
        if (!res.data.status) {
          navigate("/login");
        }
      })
      .catch((error) => {
        console.error('Error verifying auth:', error);
      });
  }, [navigate]);

  useEffect(() => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      window.ethereum.request({ method: 'eth_requestAccounts' })
        .then(accounts => setAccount(accounts[0]))
        .catch(err => console.error('Error requesting accounts:', err));
    } else {
      console.error('No Ethereum provider found. Install MetaMask.');
      alert('No Ethereum provider found. Install MetaMask.');
    }
  }, []);

  const getBalance = async () => {
    try {
      if (!web3 || !account) throw new Error('Web3 or account not initialized');
      const casino = new web3.eth.Contract(casinoABI.abi, casinoAddress);
      const balance = await casino.methods.balanceOf(account).call();
      setBalance(web3.utils.fromWei(balance, 'ether'));
    } catch (error) {
      console.error('Error getting balance:', error);
      alert('Failed to get balance. Check console for details.');
    }
  };

  const withdrawETH = async () => {
    try {
      if (!web3 || !account) throw new Error('Web3 or account not initialized');
      const amount = web3.utils.toWei('0.1', 'ether'); // Example token amount to withdraw
      const casino = new web3.eth.Contract(casinoABI.abi, casinoAddress);

      await casino.methods.withdrawETH(amount).send({
        from: account,
        gasPrice: web3.utils.toWei("10", "gwei"),
      });

      alert('Withdraw successful!');
    } catch (error) {
      console.error('Error withdrawing ETH:', error);
      alert('Failed to withdraw. Check console for details.');
    }
  };

  const handleLogout = () => {
    logout(navigate);
  };

  return (
    <Overflow className="active">
      <StyledDiv>
        <StyledLink to="/dashboard">PLAY</StyledLink>
        <br /> <br />
        <StyledBtn onClick={withdrawETH}>Withdraw ETH</StyledBtn>
        <br /> <br />
        <StyledBtn onClick={handleLogout}>Logout</StyledBtn>
        <br /> <br />
        <StyledBtn onClick={getBalance}>Get Balance</StyledBtn>
        {balance && (
          <>
            <br /> <br />
            <div>Your balance: {balance} ETH</div>
          </>
        )}
      </StyledDiv>
    </Overflow>
  );
};

export default Home;
