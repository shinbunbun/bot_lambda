'use strict';
//モジュール呼び出し
const line = require('@line/bot-sdk');
const crypto = require('crypto');

//インスタンス生成
const client = new line.Client({ channelAccessToken: process.env.ACCESSTOKEN });

exports.handler = (event, context) => {

    //署名検証
    let signature = crypto.createHmac('sha256', process.env.CHANNELSECRET).update(event.body).digest('base64');
    let checkHeader = (event.headers || {})['X-Line-Signature'];
    if(!checkHeader){
        checkHeader = (event.headers || {})['x-line-signature'];
    }
    let body = JSON.parse(event.body);
    const events = body.events;
    console.log(events);

    //署名検証が成功した場合
    if (signature === checkHeader) {
        events.forEach(async (event) => {

            let message;

            //イベントタイプごとに関数を分ける
            switch (event.type) {
                //メッセージイベント
                case "message":
                    message = messageFunc(event);
                    break;
                //フォローイベント
                /*case "follow":
                    message = followFunc(event);
                    break;*/
                //ポストバックイベント
                /*case "postback":
                    message = postbackFunc(event);
                    break;*/
            }

            //メッセージを返信
            if (message != undefined) {
                client.replyMessage(body.events[0].replyToken, message)
                    .then((response) => {
                        let lambdaResponse = {
                            statusCode: 200,
                            headers: { "X-Line-Status": "OK" },
                            body: '{"result":"completed"}'
                        };
                        context.succeed(lambdaResponse);
                    }).catch((err) => console.log(err));
            }
        });
    }

    //署名検証に失敗した場合
    else {
        console.log('署名認証エラー');
    }
};

const messageFunc = (e) => {

    //テキストではないメッセージ（画像や動画など）が送られてきた場合はコンソールに「テキストではないメッセージが送られてきました」と出力する
    if (e.message.type != "text") {
        console.log("テキストではないメッセージが送られてきました");
        return;
    }

    // ユーザーから送られてきたメッセージ
    const userMessage = e.message.text;

    //ユーザーに返信するメッセージを作成
    let message;
    message = {
        type: "text",
        text: userMessage
    };

    //「こんにちは」というメッセージが送られてきたら「Hello World」と返信して、「おはよう」と送られてきおたら「Good Morning!!」と返信するメッセージを作成
    /*if (userMessage == "こんにちは") {
        message = {
            type: "text",
            text: "Hello World"
        };
    } else if (userMessage == "おはよう") {
        message = {
            type: "text",
            text: "Good Morning!!"
        };
    }*/

    //ユーザーから送られてきたメッセージをコンソールに出力する
    console.log(`メッセージ：${userMessage}`);

    //送信するメッセージを32行目に返す
    return message;
};
