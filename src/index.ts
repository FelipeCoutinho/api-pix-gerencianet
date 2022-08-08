import * as https from "https"
import axios, { AxiosRequestConfig } from "axios"
import fs from "fs"
import path from "path"
if(process.env.NODE_ENV !== 'PROD'){
  require("dotenv").config()
}
import Express from "express"
import { send } from "process"

const app = Express()

app.set('view engine', 'ejs')
app.set('views', 'src/view')

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


app.get('/',async (req, resParam) => {

  // curl 
    const authResponse = await axios({
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
    })

    const acessToken = authResponse.data?.access_token
    
    //configurações padrões 
    const request_gn = axios.create({
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
        "original": "010.00"
      },
      "chave": "philipecout@gmail.co",
      "solicitacaoPagador": "Informe o número ou identificador do pedido."
    }

    const cob = await request_gn.post('/v2/cob',data)
    const qrcode = await request_gn.get(`/v2/loc/${cob.data.loc.id}/qrcode`)
    // resParam.send(qrcode.data)
    resParam.render('qrcode', { qrcodeImage:qrcode.data.imagemQrcode })
})

app.listen(3333, () => console.log('running 3333'))

