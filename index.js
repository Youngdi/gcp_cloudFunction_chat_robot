const Firestore = require('@google-cloud/firestore');
const PROJECTID = 'denisarobot';
const COLLECTION_NAME = 'denisa';
const jsdom = require('jsdom')
const request = require('request')
const { JSDOM } = jsdom
const fetch = require('node-fetch')
const line = require('@line/bot-sdk')

const config = {
  channelId: process.env.CHANNELID,
  channelAccessToken: process.env.CHANNELACCESSTOKEN,
  channelSecret: process.env.CHANNELSECERT
}
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN

const firestore = new Firestore({
  projectId: PROJECTID,
  timestampsInSnapshots: true,
});

exports.getMXSchoolCarousel = (req, res) => {

  const client = new line.Client(config)

  const send = async () => {
    const schoolCarousel = await fetch(
      'https://www.posgrado.unam.mx/linguistica/index.html'
    )
      .then(i => i.text())
      .then(str => {
        const { document } = new JSDOM(str).window
        const data = [...document.querySelector('#camera_wrap_1').children].map(
          i => ({
            link: i.dataset.link
              ? i.dataset.link.indexOf('doc') != -1
                ? `https://www.posgrado.unam.mx/linguistica/` + i.dataset.link
                : i.dataset.link
              : 'https://www.posgrado.unam.mx/linguistica/',
            imageSrc:
              `https://www.posgrado.unam.mx/linguistica/` + i.dataset.src
          })
        )
        return data
      })
    schoolCarousel.forEach(i => {
      createData(i.link, i.imageSrc)
    })
    // const msg = LINE_CAROUSEL_TEMPLETE(schoolCarousel)

    // client.multicast(
    //   [
    //     'U28bbb571b043fef2e425f63c038ed0f0',
    //     'U9b1aa0fcdec547d3df74937419749437'
    //   ],
    //   msg
    // )

    // request(
    //   {
    //     uri: 'https://graph.facebook.com/v2.6/me/messages',
    //     qs: { access_token: PAGE_ACCESS_TOKEN },
    //     method: 'POST',
    //     json: FB_CAROUSEL_TEMPLETE(schoolCarousel, '108452880810543')
    //   },
    //   (err, res, body) => {
    //     if (!err) {
    //       console.log('message sent!')
    //     } else {
    //       console.error('Unable to send message:' + err)
    //     }
    //   }
    // )
    // request(
    //   {
    //     uri: 'https://graph.facebook.com/v2.6/me/messages',
    //     qs: { access_token: PAGE_ACCESS_TOKEN },
    //     method: 'POST',
    //     json: FB_CAROUSEL_TEMPLETE(schoolCarousel, '3112184585459497')
    //   },
    //   (err, res, body) => {
    //     if (!err) {
    //       console.log('message sent!')
    //     } else {
    //       console.error('Unable to send message:' + err)
    //     }
    //   }
    // )
    return res.status(200).send('good')
  }

  const LINE_CAROUSEL_TEMPLETE = data => {
    const contents = data.map(i => ({
      type: 'bubble',
      hero: {
        type: 'image',
        url: i.imageSrc,
        size: 'full',
        aspectRatio: '20:13',
        aspectMode: 'cover'
      },
      action: {
        type: 'uri',
        label: 'Action',
        uri:
          i.link !== ''
            ? i.link
            : 'https://www.posgrado.unam.mx/linguistica/index.html'
      }
    }))
    return {
      type: 'flex',
      altText: '你的學校資訊',
      contents: {
        type: 'carousel',
        contents
      }
    }
  }
  const FB_CAROUSEL_TEMPLETE = (data, id) => {
    const contents = data.map(i => ({
      title: 'posgrado大學',
      image_url: i.imageSrc,
      default_action: {
        type: 'web_url',
        url: i.link,
        webview_height_ratio: 'tall'
      }
    }))
    return {
      recipient: {
        id
      },
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: contents
          }
        }
      }
    }
  }
  const createData = (link, imageSrc) => {
    firestore.collection(COLLECTION_NAME)
      .add({ link, imageSrc })
  }
  const removeAllDoc = () => {
    firestore.collection(COLLECTION_NAME).get().then(function(querySnapshot) {
      querySnapshot.forEach(function(doc) {
        doc.delete().then(() => {
          console.log('Document successfully deleted.');
        });
      });
    }).catch(err => {
      console.error(err);
    });
  }
  send()
}
