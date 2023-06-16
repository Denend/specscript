import { CyberConnect, event } from "./cc.module"
import { Twitter } from "./twitter.module"
import { headers } from "./twitter.module"
import * as fs from 'fs'

async function main() {
    fs.writeFileSync('broken.txt', '')

    let enteredEvents: string[] = []
    let brokenCT0: string[] = []

    const cyberconnect = new CyberConnect('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYWE0NTBjMWEtODE0Ny00NjkyLWIyZTctMDBiMzc5N2VjODE4IiwiZXhwIjoxNjgxMzkwODQ3LCJpYXQiOjE2ODA3ODYwNDcsImlzcyI6ImxpbmszLnRvIn0.gWiUy1KnGqm0eegbGJsdT8lcW3u8g9syGSMz6UixdrY')
    
    const twitterCookies:string[] = fs.readFileSync('cookies.txt', 'utf-8').split('\r\n')
    const proxies: string[] = fs.readFileSync('proxies.txt', 'utf-8').split('\r\n')

    async function main() {
        try{
            const events: event[] = await cyberconnect.fetchEvent()
            console.log(events.length)
            for(let event of events) {
                console.log('тут1')
                if(!enteredEvents.includes(event.id)) {
                    console.log('тут2')
                    const twitterLink = await cyberconnect.getTwitterLink(event.id, event.title)
                    console.log(twitterLink)
                    // const twitterLink = 'https://twitter.com/i/spaces/1yNGaNkepjDJj'
                    if(twitterLink) {
                        console.log('тут3')
                        console.log(`Вступаем в ${event.title}`)
                        for(let [i, cookie] of twitterCookies.entries()) {
                            (async () => {
                                console.log(i)
                                try {
                                    const jwt = await Twitter.getJWT(cookie, proxies[i])
                                    const audioCookie = await Twitter.getCookie(jwt, proxies[i])
                                    const lifeCycleToken = await Twitter.getLifeCycleToken(cookie, twitterLink, proxies[i])
                                    const session = await Twitter.startWatching(cookie, audioCookie, lifeCycleToken, proxies[i])
                                    await Twitter.ping(cookie, audioCookie, session, proxies[i], event.title)   
                                } catch(e: any) {
                                    const ct0 = cookie.split('; ct0=')[1].split('; ')[0]
                                    if(!brokenCT0.includes(ct0)){
                                        fs.appendFileSync('broken.txt', `${e.message}\n`)
                                        brokenCT0.push(ct0)
                                    }
                                    console.log(e)
                                } 
                            })()
                        }
                    } else {
                        console.log(`${event.title} - Discord event`)
                    }
                    enteredEvents.push(event.id)
                }
            }
        } catch(e: any) {
            console.log(e)
        }
    }

    await main()

    setInterval(async() => {
        await main()
    }, 60_000)
}

main()