const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

async function connectFabric(role = 'VENDOR') {
    try {
        const connectionProfilePath = path.resolve(__dirname, 'fabric', 'connection-org1.json');
        const connectionProfile = JSON.parse(fs.readFileSync(connectionProfilePath, 'utf8'));

        const walletPath = path.resolve(__dirname, 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        // Use only the available admin identity for all roles
        const identity = 'Admin@org1.example.com';

        const identityExists = await wallet.get(identity);
        
        if (!identityExists) {
            throw new Error(`Identity ${identity} not found in wallet`);
        }

        console.log(`Connecting to Fabric network using identity: ${identity} for role: ${role}`);

        const gateway = new Gateway();
        await gateway.connect(connectionProfile, {
            wallet,
            identity,
            discovery: { enabled: false, asLocalhost: true }
        });

        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('basic');

        return { gateway, contract, identity };
    } catch (error) {
        console.error('Failed to connect to Fabric network:', error);
        
        // Debug logging to see hidden gRPC error codes
        console.dir(error, { depth: null });
        
        throw error;
    }
}

module.exports = { connectFabric };
