import express from 'express';
import { Client } from 'pg';
import bodyParser from 'body-parser'
import request from 'request'
import { URL } from 'url';
import { LineLocationBody } from './models/LineLocationBody';
const port = process.env.PORT || 4000

const { DATABASE_URL } = process.env;
const client = new Client({
  connectionString: DATABASE_URL,
});
const app = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.post('/webhook', (req, res) => {
  let reply_token = req.body.events[0].replyToken
  let msg : LineLocationBody = req.body
  reply(reply_token, msg)
  res.sendStatus(200)
})
app.listen(port)
function reply(reply_token: string, msg: any) {
  let headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer {GINGZn/65Zcp4HdxRQluDqnKV1GAr5tmwp+NVLvDKhxPwyicHVv7pbbIN3M32hBN7bjF6yFxovLFQIKdT525tfcVzJYsynpxwKg3DEY5Gxze25PG3TQDvD/trnHEVCSKug7dtmMK7Hrj84E2tSVvpAdB04t89/1O/w1cDnyilFU=}'
  }
  let body = JSON.stringify({
      replyToken: reply_token,
      messages: [{
          type: 'text',
          text: msg
      }]
  })
  request.post({
      url: 'https://api.line.me/v2/bot/message/reply',
      headers: headers,
      body: body
  }, (err, res, body) => {
      console.log('status = ' + res.statusCode);
  });
}

function getNearbyFacebookEvents(replyToken : string, lineLocObj : LineLocationBody) : any {
  // https://arcane-coast-53899.herokuapp.com/api/places/?center=13.736717,100.523186
  var url = new URL('https://arcane-coast-53899.herokuapp.com/api/places/');
  url.searchParams.append('center', lineLocObj.message.latitude+','+lineLocObj.message.longitude)

  request.get(url.href, (err, res, body) => {
      if (err) { return console.log(err); }
      // console.log(body);
      reply(replyToken, body);
  });
}

export default app;