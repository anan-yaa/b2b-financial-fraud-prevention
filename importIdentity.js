const { Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        const walletPath = path.join(__dirname, 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        // This path is correct based on your ls -R output
        const mspPath = '/home/ananyaa/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp';
        
        // Use the exact filename found in your signcerts folder
        const certPath = path.join(mspPath, 'signcerts', 'Admin@org1.example.com-cert.pem');
        const keyDirectoryPath = path.join(mspPath, 'keystore');
        
        // Use the exact filename found in your keystore folder
        const keyPath = path.join(keyDirectoryPath, 'priv_sk');

        const certificate = fs.readFileSync(certPath).toString();
        const privateKey = fs.readFileSync(keyPath).toString();

        const identity = {
            credentials: {
                certificate,
                privateKey,
            },
            mspId: 'Org1MSP',
            type: 'X.509',
        };

        await wallet.put('Admin@org1.example.com', identity);
        console.log('Successfully imported "Admin@org1.example.com" into the wallet');

    } catch (error) {
        console.error(`Failed to import identity: ${error}`);
        process.exit(1);
    }
}

main();