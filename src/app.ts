import bodyParser from 'body-parser';
import express from 'express';
import { Client } from 'pg';
import request from 'request';
import { URL } from 'url';
import { LineFlexAction } from './models/LineFlexMessage/LineFlexAction';
import { LineFlexBody } from './models/LineFlexMessage/LineFlexBody';
import { LineFlexContents } from './models/LineFlexMessage/LineFlexContents';
import { LineFlexContentsContainer } from './models/LineFlexMessage/LineFlexContentsContainer';
import { LineFlexFooter } from './models/LineFlexMessage/LineFlexFooter';
import { LineFlexHeader } from './models/LineFlexMessage/LineFlexHeader';
import { LineFlexHero } from './models/LineFlexMessage/LineFlexHero';
import { LineFlexInnerContents } from './models/LineFlexMessage/LineFlexInnerContents';
import { LineFlexMessage } from './models/LineFlexMessage/LineFlexMessage';
import { LineLocationBody } from './models/LineLocationBody';

const dataFromFb: Datum = null;
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
    'Content-Type': 'application/json',
    charset: 'utf-8',
  };
  console.log('lineLocObj', lineLocObj);
  console.log('href', url.href);
  request.get({ url: url.href, headers }, (err, res, body) => {
    if (err) {
      return console.log(err);
    }
    const message = JSON.parse(res.body);
    // console.log(message.data[0]);
    // reply(replyToken, res.body.data[0]);
    let lineFlexResponse = new LineFlexMessage();
    lineFlexResponse = prepareLineFlexResponse(message.data);
    console.log('lineFlexResponse', lineFlexResponse);
    reply(replyToken, lineFlexResponse);
  });
}

function prepareLineFlexResponse(fbDataList: Datum[]): LineFlexMessage {
  // console.log(fbDataList);
  const responseFlex = new LineFlexMessage();
  responseFlex.type = 'flex';
  responseFlex.altText = 'Flex Message';
  responseFlex.contents = new LineFlexContentsContainer();
  responseFlex.contents.type = 'carousel';
  responseFlex.contents.contents = [];
  fbDataList.forEach(fbData => {
    console.log(fbData);
    const mainContents = prepareLineFlexContents(fbData);
    responseFlex.contents.contents.push(mainContents);
  });
  return responseFlex;
}

function prepareLineFlexContents(fbData: Datum): LineFlexContents {
  const lineFlexContents = new LineFlexContents();
  lineFlexContents.type = 'bubble';
  lineFlexContents.header = prepareLineFlexHeader(fbData);
  lineFlexContents.hero = prepareLineFlexHero(fbData);
  lineFlexContents.body = prepareLineFlexBody(fbData);
  lineFlexContents.footer = prepareLineFlexFooter(fbData);
  return lineFlexContents;
}

function prepareLineFlexHeader(fbData: Datum): LineFlexHeader {
  const lineFlexHeader = new LineFlexHeader();
  lineFlexHeader.type = 'box';
  lineFlexHeader.layout = 'vertical';
  lineFlexHeader.flex = 0;
  lineFlexHeader.contents = prepareLineFlexInnerContents('header', fbData);
  return lineFlexHeader;
}

function prepareLineFlexHero(fbData: Datum): LineFlexHero {
  const lineFlexHero = new LineFlexHero();
  lineFlexHero.type = 'image';
  lineFlexHero.url = 'https://scdn.line-apps.com/n/channel_devcenter/img/fx/01_1_cafe.png';
  lineFlexHero.size = 'full';
  lineFlexHero.aspectRatio = '20:13';
  lineFlexHero.aspectMode = 'cover';
  lineFlexHero.action = prepareLineFlexAction('hero', fbData);
  return lineFlexHero;
}

function prepareLineFlexInnerContents(option: string, fbData?: Datum): LineFlexInnerContents[] {
  if (option === 'header') {
    const lineFlexInnerContentLists = [];
    const innerContent = new LineFlexInnerContents();
    innerContent.type = 'text';
    innerContent.text = fbData && fbData.name !== '' ? fbData.name : 'place name';
    innerContent.size = 'xl';
    innerContent.weight = 'bold';
    lineFlexInnerContentLists.push(innerContent);
    return lineFlexInnerContentLists;
  } else if (option === 'body') {
    const lineFlexInnerContentLists = [];
    const innerContent = new LineFlexInnerContents();
    innerContent.type = 'box';
    innerContent.layout = 'horizontal';
    innerContent.contents = prepareLineFlexInnerContents('body-2', fbData);
    const innerContent2 = new LineFlexInnerContents();
    innerContent2.type = 'box';
    innerContent2.layout = 'baseline';
    innerContent2.margin = 'md';
    innerContent2.contents = prepareLineFlexInnerContents('body-3', fbData);
    lineFlexInnerContentLists.push(innerContent);
    lineFlexInnerContentLists.push(innerContent2);
    return lineFlexInnerContentLists;
  } else if (option === 'body-2') {
    const body2Contents = [];
    const body2Content1 = new LineFlexInnerContents();
    const body2Content2 = new LineFlexInnerContents();
    body2Content1.type = 'text';
    body2Content1.text = 'Categories: ';
    body2Content1.size = 'md';
    body2Content1.weight = 'bold';
    body2Content2.type = 'text';
    body2Content2.text = 'Text ';
    body2Content2.size = 'md';
    body2Content2.align = 'start';
    body2Content2.wrap = true;
    body2Contents.push(body2Content1);
    body2Contents.push(body2Content2);
    return body2Contents;
  } else if (option === 'body-3') {
    const ratings = [];
    const score: number = Math.round(fbData.overall_star_rating);
    for (let index = 1; index <= 5; index++) {
      if (fbData) {
        const rating = prepareRatings(index <= score ? '1' : '0');
        ratings.push(rating);
      }
    }
    const additionalData = new LineFlexInnerContents();
    additionalData.type = 'text';
    additionalData.text = '4.0';
    additionalData.flex = 0;
    additionalData.margin = 'md';
    additionalData.type = 'sm';
    additionalData.color = '#999999';
    ratings.push(additionalData);
    return ratings;
  } else if (option === 'footer') {
    const footerContentList = [];
    const footerContent1 = new LineFlexInnerContents();
    const footerContent2 = new LineFlexInnerContents();
    footerContent1.type = 'button';
    footerContent1.action = prepareLineFlexAction('footer', fbData);
    footerContent1.height = 'sm';
    footerContent1.style = 'link';
    footerContent2.type = 'spacer';
    footerContent2.size = 'sm';
    footerContentList.push(footerContent1);
    footerContentList.push(footerContent2);
    return footerContentList;
  }
}

function prepareRatings(isStar: string): LineFlexInnerContents {
  const ratingObj = new LineFlexInnerContents();
  ratingObj.type = 'icon';
  ratingObj.url =
    isStar === '1'
      ? 'https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png'
      : 'https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gray_star_28.png';
  ratingObj.size = 'sm';
  return ratingObj;
}

function prepareLineFlexAction(option: string, fbData: Datum): LineFlexAction {
  if (option === 'hero') {
    const lineFlexAction = new LineFlexAction();
    lineFlexAction.type = 'uri';
    lineFlexAction.type = 'Line';
    lineFlexAction.type = 'https://linecorp.com/';
    return lineFlexAction;
  } else if (option === 'footer') {
    const lineFlexAction = new LineFlexAction();
    lineFlexAction.type = 'uri';
    lineFlexAction.type = 'Line';
    lineFlexAction.type = fbData && fbData.link !== '' ? fbData.link : 'https://linecorp.com/';
    return lineFlexAction;
  } else {
    const lineFlexAction = new LineFlexAction();
    lineFlexAction.type = 'uri';
    lineFlexAction.type = 'Line';
    lineFlexAction.type = 'https://linecorp.com/';
    return lineFlexAction;
  }
}

function prepareLineFlexBody(fbData: Datum): LineFlexBody {
  const lineFlexBody = new LineFlexBody();
  lineFlexBody.type = 'box';
  lineFlexBody.layout = 'vertical';
  lineFlexBody.contents = prepareLineFlexInnerContents('body', fbData);
  return lineFlexBody;
}

function prepareLineFlexFooter(fbData: Datum): LineFlexFooter {
  const lineFlexFooter = new LineFlexFooter();
  lineFlexFooter.type = 'box';
  lineFlexFooter.layout = 'vertical';
  lineFlexFooter.flex = 0;
  lineFlexFooter.spacing = 'sm';
  lineFlexFooter.contents = prepareLineFlexInnerContents('footer', fbData);
  return lineFlexFooter;
}

export default app;
