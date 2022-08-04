const https = require("https")
const axios = require("axios")
const fs = require("fs")
const path = require("path")

if(process.env.NODE_ENV !== 'PROD'){
  require("dotenv").config()
}

//carregando o certificado
const cert = fs.readFileSync(
  path.resolve(__dirname,`../hml/${process.env.CERTIFICATE}`) // o path.resolve retorna o caminho certinho de onde está o arquivo
)

const agent = new https.Agent({
  pfx:cert,
  passphrase:""
})

//transformano as credenciais em base64
const creadntials = Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`)
.toString("base64")

// curl --location --request POST 'https://api-pix-h.gerencianet.com.br/oauth/token' \
// --header 'x-client-cert-pem: {{X-Certificate-Pem}}' \
// --header 'Authorization: Basic Q2xpZW50X0lkXzZkOGViMTdjMjhhZDZlMTY0ZjkzNWZlZGM0NGM3ODcxN2QxMTM2OTM6Q2xpZW50X1NlY3JldF9kODM0NmFkODEyMTVkNzFjMGRjZDRkZWRlMjI2OGNhM2EyMzM4N2Iz' \
// --header 'Content-Type: application/json' \
// --data-raw '{
//     "grant_type": "client_credentials"
// }'

axios({
  method:"POST",
  url:`${process.env.ENDPOINT}/oauth/token`,
  headers:{
    Authorization:`Basic ${creadntials}`,
    'Content-Type':'application/json'
  },
  httpsAgent: agent,
  data: {
    "grant_type": "client_credentials"
  }
}).then(res => console.log(res))


