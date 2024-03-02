const secretKey = process.env.Secret_Key;

module.exports = function () {
    
    
    if (!secretKey) {
        console.log('FATAL ERROR:jwtPrivateKey is not defined.');
        process.exit(1);
        process.exit(0); //code 0 means success anything but 0 means failure
        // throw new Error('FATAL ERROR:Secret_Key is not defined.');
    }
    
    
    // if (!config.get('jwtPrivateKey')) {//config.get using this to read environment variable jwtPrivateKey
    //     console.log('FATAL ERROR:jwtPrivateKey is not defined.');
    //     process.exit(1);//process.exit(0); code 0 means success anything but 0 means failure
    // }
}