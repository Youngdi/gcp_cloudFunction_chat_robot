const Firestore = require('@google-cloud/firestore')
const PROJECTID = 'denisarobot'
const COLLECTION_NAME = 'denisa'
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
const client = new line.Client(config)
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN

const firestore = new Firestore({
  projectId: PROJECTID,
  timestampsInSnapshots: true
})

exports.main = (req, res) => {
  
  const send = async () => {

    const schoolCarousel = await getSchoolCarousel()
    const prevData = await getData()
    
    if (checkAllIsNotSame(prevData, schoolCarousel) || prevData.length !== schoolCarousel.length) {
      if (prevData.length !== 0) {
        await removeAllDoc()
      }
      schoolCarousel.forEach(i => {
        createData(i.link, i.imageSrc)
      })

      const lineMsg = LINE_CAROUSEL_TEMPLETE(schoolCarousel)
      const fbMsg = FB_CAROUSEL_TEMPLETE(schoolCarousel, '3112184585459497')
      callChatBot({ lineMsg, fbMsg })

      return res
        .status(200)
        .send('I have send notifiction to line and messenger')
    } else {
      return res.status(200).send("It's all same")
    }
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

  const createData = (link, imageSrc) => firestore.collection(COLLECTION_NAME).add({ link, imageSrc })
  
  const getData = () => {
    return firestore
      .collection(COLLECTION_NAME)
      .get()
      .then(function (querySnapshot) {
        let data = []
        querySnapshot.forEach(function (doc) {
          data.push({ id: doc.id, ...doc.data() })
        })
        return data
      })
      .catch(err => {
        console.error(err)
        return false
      })
  }

  const removeAllDoc = () => {
    firestore
      .collection(COLLECTION_NAME)
      .get()
      .then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          firestore
            .collection(COLLECTION_NAME)
            .doc(doc.id)
            .delete()
            .then(() => {
              console.log('Document successfully deleted.')
              return true
            })
        })
      })
      .catch(err => {
        console.error(err)
        return false
      })
  }

  const checkAllIsNotSame = (prev, next) => {
    if (!prev) return true;
    let isAllNotSame = false
    for (let i = 0; i < next.length; i++) {
      if (
        !prev.some(
          j => j.link == next[i].link
        )
      ) {
        isAllNotSame = true
        break
      }
    }
    return isAllNotSame
  }

  const callChatBot = ({ lineMsg, fbMsg }) => {
    client.multicast(
      [
        'U28bbb571b043fef2e425f63c038ed0f0',
        'U9b1aa0fcdec547d3df74937419749437'
      ],
      lineMsg
    )
    request(
      {
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: fbMsg
      },
      (err, res, body) => {
        if (!err) {
          console.log('message sent!')
        } else {
          console.error('Unable to send message:' + err)
        }
      }
    )
  }

  const getSchoolCarousel = () => {
    return fetch('https://www.posgrado.unam.mx/linguistica/index.html')
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
  }

  send()
}
