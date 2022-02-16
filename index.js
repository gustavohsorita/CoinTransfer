const restify = require('restify')

const server = restify.createServer({
    name: 'myServer',
    version: '1.0.0'
})

server.get('/hello', async (req, resp, next) => {
    // Need access to my path and file system
    var fs = require('fs');

    // Ethereum javascript libraries needed
    var Web3 = require('web3');
    var Tx = require('ethereumjs-tx');

    // Rather than using a local copy of geth, interact with the ethereum blockchain via infura.io
    const web3 = new Web3(new Web3.providers.HttpProvider('https://data-seed-prebsc-1-s1.binance.org:8545/'));

    // Create an async function so I can use the "await" keyword to wait for things to finish
    const main = async () => {
        // This code was written and tested using web3 version 1.0.0-beta.26
        console.log(`web3 version: ${web3.version}`)

        console.log("A");

        // Who holds the token now?
        var myAddress = "0xD3...";

        // Who are we trying to send this token to?
        var destAddress = "0x84...";

        // If your token is divisible to 8 decimal places, 42 = 0.00000042 of your token
        var transferAmount = 10;

        console.log("B");

        // Determine the nonce
        var count = await web3.eth.getTransactionCount(myAddress);
        console.log(`num transactions so far: ${count}`);

        console.log("C");

        // This file is just JSON stolen from the contract page on etherscan.io under "Contract ABI"
        //var abiArray = JSON.parse(fs.readFileSync(path.resolve(__dirname, './tt3.json'), 'utf-8'));
        var abiArray = JSON.parse(fs.readFileSync('abi.json', 'utf-8'));

        console.log("D");

        // This is the address of the contract which created the ERC20 token
        var contractAddress = "0xfA...";
        var contract = new web3.eth.Contract(abiArray, contractAddress, { from: myAddress });

        console.log("E");

        // How many tokens do I have before sending?
        var balance = await contract.methods.balanceOf(myAddress).call();

        console.log("F");

        console.log(`Balance before send: ${balance}`);

        // I chose gas price and gas limit based on what ethereum wallet was recommending for a similar transaction. You may need to change the gas price!
        var rawTransaction = {
            "from": myAddress,
            "nonce": web3.utils.toHex(count),
            "gasPrice":web3.utils.toHex(5000000000),
            "gasLimit":web3.utils.toHex(210000),
            "value":web3.utils.toHex(0),
            "to": contractAddress,
            "data": contract.methods.transfer(destAddress, transferAmount).encodeABI(),
            "chainId": web3.utils.toHex(97)
        };

        console.log("G");

        // The private key must be for myAddress
        var privKey = new Buffer('cfb...', 'hex');
        var tx = new Tx(rawTransaction);
        //var tx = new Tx(rawTransaction, {'chain': chain})

        console.log("H");

        tx.sign(privKey);
        var serializedTx = tx.serialize();

        console.log("I");

        // Comment out these three lines if you don't really want to send the TX right now
        console.log(`Attempting to send signed tx:  ${serializedTx.toString('hex')}`);
        var receipt = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
        console.log(`Receipt info:  ${JSON.stringify(receipt, null, '\t')}`);

        // The balance may not be updated yet, but let's check
        balance = await contract.methods.balanceOf(myAddress).call();
        console.log(`Balance after send: ${balance}`);
    }

    main();

    resp.json({message: 'world'})
})

server.listen(3000, () => {
    console.log('api listening 3000')
})