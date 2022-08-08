import * as https from "https"
import axios, { AxiosRequestConfig } from "axios"
import fs from "fs"
import path from "path"
import Express from "express"

const app = Express()

app.set('view engine', 'ejs')
app.set('views', 'src/view')

app.get('/', (req, res) => {
  
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

  // curl 
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
  }).then(res => {
    const acessToken = res.data?.access_token
    //configurações padrões 
    const request = axios.create({
      baseURL:process.env.ENDPOINT,
      httpsAgent:agent,
      headers:{
        "Authorization":`Bearer ${acessToken}`,
        'Content-Type':'application/json'
      }
    })
    const data = {
      "calendario": {
        "expiracao": 3600
      },
      "valor": {
        "original": "100.00"
      },
      "chave": "philipecout@gmail.co",
      "solicitacaoPagador": "Informe o número ou identificador do pedido."
    }

    request.post('/v2/cob',data).then( response =>{
        // res.status('200').json()
        
    })

  })

})

app.listen(3333, () => console.log('running 3333'))

