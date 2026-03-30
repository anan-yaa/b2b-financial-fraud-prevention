const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

async function connectFabric(role = 'VENDOR') {
    let gateway;
    try {
        const connectionProfilePath = path.resolve(__dirname, 'fabric', 'connection-org1.json');
        const connectionProfile = JSON.parse(fs.readFileSync(connectionProfilePath, 'utf8'));

        const walletPath = path.resolve(__dirname, 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        /**
         * HARD FIX: 
         * Your wallet image shows 'Admin@org1.example.com.id' exists.
         * We will bypass the 'role' variable for the identity lookup 
         * to ensure we use a valid certificate recognized by the Peer.
         */
        const identityToUse = 'Admin@org1.example.com'; 
        
        const identityExists = await wallet.get(identityToUse);

        if (!identityExists) {
            console.error(`ERROR: Identity ${identityToUse} not found in ${walletPath}`);
            console.log('Available identities in wallet:', await wallet.list());
            throw new Error(`Identity ${identityToUse} is missing from the wallet folder.`);
        }

        console.log(`[Fabric Gateway] Connecting as: ${identityToUse} (Role context: ${role})`);

        gateway = new Gateway();
        
        // Connect using the connection profile and the verified identity
        await gateway.connect(connectionProfile, {
            wallet,
            identity: identityToUse,
            discovery: { enabled: false, asLocalhost: true }
        });

        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('basic');

        return { gateway, contract, identity: identityToUse };

    } catch (error) {
        console.error('Failed to connect to Fabric network:', error);
        
        // Detailed error logging
        if (error.responses) {
            console.error('Peer responses:', JSON.stringify(error.responses, null, 2));
        }

        if (gateway) {
            await gateway.disconnect();
        }
        
        throw error;
    }
}

module.exports = { connectFabric };