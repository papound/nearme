import bodyParser from 'body-parser';
import express from 'express';
import { Client } from 'pg';
import request from 'request';
import { URL } from 'url';
import { LineLocationBody } from './models/LineLocationBody';

const { DATABASE_URL } = process.env;
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/webhook', (req, res) => {
  const reply_token = req.body.events[0].replyToken;
  const msg = req.body.events[0];
//   console.log("msg", msg);
  getNearbyFacebookEvents(reply_token, msg);
  res.sendStatus(200);
});
function reply(reply_token: string, msg: any) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization:
      'Bearer {GINGZn/65Zcp4HdxRQluDqnKV1GAr5tmwp+NVLvDKhxPwyicHVv7pbbIN3M32hBN7bjF6yFxovLFQIKdT525tfcVzJYsynpxwKg3DEY5Gxze25PG3TQDvD/trnHEVCSKug7dtmMK7Hrj84E2tSVvpAdB04t89/1O/w1cDnyilFU=}',
  };
  const body = JSON.stringify({
    replyToken: reply_token,
    messages: [
      {
        type: 'text',
        text: msg,
      },
    ],
  });
  request.post(
    {
      url: 'https://api.line.me/v2/bot/message/reply',
      headers,
      body,
    },
    (err, res, body) => {
      console.log('status = ' + res.statusCode);
    }
  );
}

function getNearbyFacebookEvents(replyToken: string, lineLocObj: LineLocationBody): any {
  // https://arcane-coast-53899.herokuapp.com/api/places/?center=13.736717,100.523186
  const url = new URL('https://arcane-coast-53899.herokuapp.com/api/places/');
  url.searchParams.append(
    'center',
    lineLocObj.message.latitude + ',' + lineLocObj.message.longitude
  );
  const headers = {
    'charset': 'utf-8',
  }
  console.log("lineLocObj", lineLocObj);
  console.log("href", url.href);
  request.get({ url: url.href, headers }, (err, res, body) => {
    if (err) {
      return console.log(err);
    }
    console.log(res.body);
    reply(replyToken, "test");
  });
}

export default app;
