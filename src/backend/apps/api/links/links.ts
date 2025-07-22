import { getHttpStatusItem } from '../../../_shared/http/http';
import { LOG, OK, WARNING } from '../../../_shared/log/log';

export const linkChecker = (linkHref: string) => {
                
    let statusItem: { isValid: boolean, status: string, redirects?: string, lastLocation?: string, initialUrl?: string }; 
    const httpStatus = getHttpStatusItem(linkHref, false, 10);
    const num = parseInt(httpStatus.status, 10);
    if(num !== 200){
        const httpStatusRedirects = getHttpStatusItem(linkHref, true, 10);
        const newStatus  = httpStatusRedirects.status;
        const numNewStatus = parseInt(newStatus, 10);
        if(numNewStatus !== 200){
            statusItem = { isValid: false, status: newStatus === '0' ? 'unknown' : newStatus, redirects: httpStatusRedirects.redirects, lastLocation: httpStatusRedirects.lastLocation, initialUrl: httpStatusRedirects.initialUrl };
            LOG(WARNING, `Link ${linkHref} returned status ${numNewStatus} for ${httpStatusRedirects.lastLocation}`);
            
        } else {
            statusItem = { isValid: true,  status: newStatus, redirects: httpStatusRedirects.redirects, lastLocation: httpStatusRedirects.lastLocation, initialUrl: httpStatusRedirects.initialUrl };
            LOG(OK, `Link ${linkHref} returned status ${numNewStatus} for ${httpStatusRedirects.lastLocation}`);
        }
        // const newUrl  httpStatusRedirects.lastLocat
        // const numStatusRedirects = parseInt(httpStatusRedirects.status, 10);
        // if(numStatusRedirects !== 200){
        //     console.log(httpStatus);
        //     LOG(WARNING, `Link ${linkHref} returned status ${httpStatus.code}`);
        //     data.warnings.push(`Link ${linkHref} returned status ${httpStatus.code}`);
        // } else {
        //     LOG(OK, `Link ${linkHref} returned status ${httpStatus.code}`);
        // }
    } else {
        statusItem = { isValid: true, status: httpStatus.status, redirects: '0', lastLocation: httpStatus.lastLocation, initialUrl: httpStatus.initialUrl };
        LOG(OK, `Link ${linkHref} returned status ${httpStatus.status}`);
    }
    return statusItem;
}
export const getLinksDetails = () => {
     // for(const link of details.links) {
            //     const linkHref = link.href;
            //     const linkText = link.text;
            //     if(linkHref && linkHref !== '') {
            //         const statusItem = linkChecker(linkHref);
            //         if(!statusItem.isValid) {
            //             workshopData[id].warnings.push(`Link ${linkHref} returned status ${statusItem.status}`);
            //             LOG(WARNING, `Link ${linkHref} returned status ${statusItem.status}`);
            //         } else {
            //             workshopData[id].links = workshopData[id].links || [];
            //             workshopData[id].links.push({
            //                 text: linkText,
            //                 href: linkHref,
            //                 status: statusItem.status,
            //                 redirects: statusItem.redirects,
            //                 lastLocation: statusItem.lastLocation,
            //                 initialUrl: statusItem.initialUrl,
            //             });
            //         }
            //     } else {
            //         LOG(WARNING, `No href found for link: ${linkText}`);
            //     }
            // }
}