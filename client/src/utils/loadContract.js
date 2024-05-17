import Web3 from 'web3';

const loadContract = async (name, provider) => {
    const web3 = new Web3(provider);

    // Fetch the contract ABI from the local JSON file
    const path = `../../../blockchain/build/contracts/${name}.json`;
    const response = await fetch(path);
    const Artifact = await response.json();

    const networkId = '5777'; // Ganache
    const address = Artifact.networks[networkId] && Artifact.networks[networkId].address;

    if (!address) {
        throw new Error(`Contract ${name} not found on network ${networkId}.`);
    }

    const contractInstance = new web3.eth.Contract(Artifact.abi, address);
    return contractInstance;
};

export default loadContract;







