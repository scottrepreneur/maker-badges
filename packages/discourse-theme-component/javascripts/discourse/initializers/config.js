const ThemeConfig = {
    development: {
        lambdaUrl: (message)=>{return `https://f44lkeezmb.execute-api.us-east-1.amazonaws.com/dev/discourse?username=${message.username}&address=${message.address}&signature=${message.signature}`;}
    },
    digitalOcean: {
        lambdaUrl: (message)=>{return `https://web33.ngrok.io/discourse?username=${message.username}&address=${message.address}&signature=${message.signature}`;}
    },
    production: {
        lambdaUrl: (message)=>{return `https://3nsc1491ed.execute-api.us-east-1.amazonaws.com/dev/dev/discourse?username=${message.username}&address=${message.address}&signature=${message.signature}`;}
    }
};

export default {
    name: 'maker-badges-config',
    initialize(){
        globalThis.ThemeConfig = ThemeConfig;
    }
}