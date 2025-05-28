import { command } from "../../_shared/cmd/cmd";
import { readFile, writeFileSync } from "../../_shared/fs/fs";
import { getHttpStatusItem } from "../../_shared/http/http";
import { LOG, OK, WARNING } from "../../_shared/log/log";
const HTMLParser = require('node-html-parser');

const PAGE = 'https://craft-conf.com/2025'
const scheduleUrl = [`${PAGE}/schedule`]

const getPageData = (url: string) => {
    const httpStatus = getHttpStatusItem(url, true);

    const html = command(`curl -s ${url}`);
    var root = HTMLParser.parse(html);
    const data = root.querySelector('#app');
    const jsonText = data.getAttribute('data-page');
    const json = JSON.parse(jsonText);
    
    return json;
}
const getWebsiteData = (url: string, properties: string[]) => {
    const mainData = getPageData(url);
    const json: any = {
        url: mainData.url,
        version: mainData.version,
    }
    for(const property of properties){
        if (!json.hasOwnProperty(property)) {
            json[property] = mainData.props[property];
        }

    }
    
    return json;
}
const removeHtmlTags = (htmlString: string) => {
    if (!htmlString) {
        return '';
    }
    return htmlString.replace(/<[^>]*>/g, '');
}

const processData = (data: any) => {
    const finalData: any = {
        stages: {},
        talks: {},
        tags: {},
        speakers: {},
    }
    for (const day of data.schedule) {
        const stages = day.stages;
        for (const stage of stages) {
            const stageId = stage.name;
            if (!finalData.stages[stageId]) {
                finalData.stages[stageId] = {
                    id: stage.id,
                    name: stage.name,
                    color: stage.color,
                    description: stage.description,
                    slug: stage.slug,
                    talks: []
                };
            }
            const slots = stage.slots;
            for(const slot of slots){
                const startTime = slot.start_time;
                const endTime = slot.end_time;
                const talk = slot.talk;
                if (!talk) {
                    continue; // Skip if no talk is present
                }
                const talkId = talk.id;

                // get speaker data from talk of slots
                for(const speaker of talk.speakers){
                    const speakerId = speaker.slug;
                    if (!finalData.speakers[speakerId]) {
                        finalData.speakers[speakerId] = {
                            id: speaker.pivot?.speaker_id || speaker.id,
                            topic: speaker.topic,
                            name: speaker.name,
                            bio: removeHtmlTags(speaker.bio),
                            image: speaker.image,
                            slug: speaker.slug
                        };
                    }
                }

                
                // get tag from talk of slots
                for(const tag of talk.tags){
                    const tagId = tag.name;
                    if (!finalData.tags[tagId]) {
                        finalData.tags[tagId] = {
                            id: tag.id,
                            name: tag.name,
                            description: tag.description,
                            slug: tag.slug
                        };
                    }
                }
                const speakers = talk.speakers.map((speaker: any) => {
                    return {
                        name: speaker.name,
                        slug: speaker.slug,
                        topic: speaker.topic,
                        id: speaker.pivot?.speaker_id || speaker.id
                    }
                });
                const tags = talk.tags.map((tag: any) => { return{ id: tag.id, name: tag.name } });
                const talk_item = {
                    id: talkId,
                    title: talk.title,
                    stage: stage.name,
                    is_keynote: talk.is_keynote,
                    is_live: !talk.is_online,
                    speakers: [...speakers],
                    tags: [...tags],
                    date: day.date,
                    startTime: startTime,
                    endTime: endTime,
                    slug: talk.slug
                }
                if(!finalData.talks[talkId]){
                    finalData.talks[talkId] = {...talk_item};
                    finalData.stages[stageId].talks.push(talkId);
                    // LOG(OK, `Processing talk: ${talk.title} (${talkId})`);
                    // const talkeItem= getWebsiteData(`https://craft-conf.com/2025/talk/${talk.slug}`, ['talk', 'speakers', 'tags']);
                    // const talkData = talkeItem.talk;
                    // finalData.talks[talkId].topic = talkData.topic;
                    // finalData.talks[talkId].level = talkData.level;
                    // finalData.talks[talkId].video_url = talkData.video_url;
                    // finalData.talks[talkId].slides_url = talkData.slides_url;
                    // finalData.talks[talkId].description = removeHtmlTags(talkData.abstract); // remove html
                    // for(const speaker of talkeItem.speakers) {
                    //     const speakerId = speaker.slug;
                    //     if (finalData.speakers[speakerId]) {
                    //         finalData.speakers[speakerId].bio = speaker.bio;
                    //         finalData.speakers[speakerId].image = speaker.image;
                    //         finalData.speakers[speakerId].company = speaker.company;
                    //         finalData.speakers[speakerId].twitter = speaker.twitter_handle;
                    //         finalData.speakers[speakerId].linkedin = speaker.linkedin_profile;
                    //     } else {
                    //         LOG(WARNING, `Speaker ${speakerId} not found in main data`);
                    //     }
                    // }
                } else {
                    LOG(WARNING, `Talk ${talk.title} (${talkId}) already exists, skipping duplicate.`);
                }
            }
        }
    }
    const IS_DEV = process.env.NODE_ENV === 'development';
    LOG(OK, `isDEV: ${IS_DEV}`);
    const numAllTalks = Object.keys(finalData.talks).length;
    let numTalk = 0;
    // get details of each talk
    for (const talkId in finalData.talks) {
        numTalk++;
        if (IS_DEV && numTalk > 10) {
            LOG(WARNING, `Skipping further talk details in dev mode after 10 talks.`);
            break; // Skip further processing in dev mode
        }
        LOG(OK, `[${numTalk}/${numAllTalks}]Processing talk details for: ${talkId}`);
        const talk = finalData.talks[talkId];
        const talkData = getWebsiteData(`${PAGE}/talk/${talk.slug}`, ['talk', 'speakers', 'tags']);
        const talkItem = talkData.talk;
        finalData.talks[talkId].topic = talkItem.topic;
        finalData.talks[talkId].level = talkItem.level;
        finalData.talks[talkId].video_url = talkItem.video_url;
        finalData.talks[talkId].slides_url = talkItem.slides_url;
        finalData.talks[talkId].description = removeHtmlTags(talkItem.abstract); // remove html
        for (const speaker of talkData.speakers) {
            const speakerId = speaker.slug;
            if (finalData.speakers[speakerId]) {
                finalData.speakers[speakerId].bio = speaker.bio;
                finalData.speakers[speakerId].image = speaker.image;
                finalData.speakers[speakerId].company = speaker.company;
                finalData.speakers[speakerId].twitter = speaker.twitter_handle;
                finalData.speakers[speakerId].linkedin = speaker.linkedin_profile;
            } else {
                LOG(WARNING, `Speaker ${speakerId} not found in main data`);
            }
        }
    }
    return finalData;
}

const createMarkdownFile = (data: any) => {
    let markdownContent = '';
    for (const stageId in data.stages) {
        const stage = data.stages[stageId];
        markdownContent += `## Stage: ${stage.name}\n\n`;
        markdownContent += `${stage.description}\n\n`;
        markdownContent += `### Talks:\n\n`;
        for (const talkId of stage.talks) {
            const talk = data.talks[talkId];
            markdownContent += `- **${talk.title}** by ${talk.speakers.map(s => s.name).join(', ')}\n`;
            markdownContent += `  - Date: ${talk.date}\n`;
            markdownContent += `  - Time: ${talk.startTime} - ${talk.endTime}\n`;
            markdownContent += `  - Tags: ${talk.tags.map(t => t.name).join(', ')}\n`;
            markdownContent += `  - [Details](${PAGE}/talk/${talk.slug})\n\n`;
        }
    }
    return markdownContent;

}

LOG(OK, ' API is running...more!!!');
const origData = getWebsiteData(scheduleUrl[0], ['schedule', 'tags']);
const optimizedData = processData(origData);
const cwd = process.cwd();
const markdownContent = createMarkdownFile(optimizedData);
// const talkData= getWebsiteData('https://craft-conf.com/2025/talk/cat-hicks', ['talk', 'speakers', 'tags']);
// writeFileSync(`${cwd}/src/_data/talk_sample.json`, JSON.stringify(talkData, null, 4));
writeFileSync(`${cwd}/src/_data/optimized.json`, JSON.stringify(optimizedData, null, 4));
writeFileSync(`${cwd}/src/_data/markdown.md`, markdownContent);
writeFileSync(`${cwd}/src/_data/orig.json`, JSON.stringify(origData, null, 4));