---
layout:     post
title:      "What to Expect When You Are Expecting Content Security Policy Reports"
date:       2015-08-10 09:00:00
categories: content security policy, monitoring, security
---

[Content Security Policy (CSP)](http://www.w3.org/TR/CSP2/) allows you to dictate a policy for content restrictions on a web site that is enforced by the browser. For instance, by setting a CSP header, you can instruct browser to allow load assets that originate from your domain over HTTPS. The CSP spec allows you to build a very specific policy for your site that can handle all of the different types of resources that a site might load.

In addition to blocking resources that violate the defined CSP, the CSP spec details a mechanism for sending reports of such violations. Monitoring these violations can help you ensure that your site is never serving content that violates the CSP whether those violations are the result of producer, developer, or hacker actions.

I have been slowly working on an OSS app to express an API for storing and retrieving CSP reports. A major challenge that I have faced with this project is figuring out how to handle the wide array of reports that are sent by different browsers. Armed with an OSS account from [Browserstack]() (thanks Browserstack), I set out to collect CSP violation reports from every browser I could get my hands on to figure out what I should expect when receiving CSP reports. In this article, I will outline the important differences that I observed cross browser with a goal of providing enough information to be able to write a program to normalize such reports.

## Key Points

This article is going to get deep into the weeds and if you just want the high level findings, here they are:

* I captured more than 2,200 CSP reports that are broken into browser and version and include header information. 
* To capture most of the variation, there are three different styles of reports that I found. I classify them as "Blink", "Firefox", and "Early Webkit" variants, which can be observed with Chrome 44, Firefox 39, and Chrome 20, respectively.

# Method

To capture these reports, I wrote a series of Node scripts to build a page with CSP violations, a naive CSP report collector, and some additional scripts for post-processing the data. All of these scripts and resources can be viewed in the [Report Only Capture repository](https://github.com/tollmanz/report-only-capture). I attempted to trigger alerts on most of the directives that are allowed; however, I was unable to trigger on all of them primarily due to lack of time. My sample includes violations of the following directives:

* script-src
* style-src
* img-src
* frame-src
* child-src
* media-src
* object-src

I set the following CSP directives to be able to capture the reports:

{% highlight bash %}
default-src https://localhost:8123/; child-src https://localhost:8123/; connect-src https://localhost:8123/; font-src https://localhost:8123/; img-src https://localhost:8123/; media-src https://localhost:8123/; object-src https://localhost:8123/; script-src https://localhost:8123/; style-src https://localhost:8123/; form-action https://localhost:8123/; frame-ancestors 'none'; plugin-types 'none'; report-uri http://localhost:8123/csp-report
{% endhighlight %}

This value was set for 3 different headers in order to capture reports for older browsers:

{% highlight bash %}
Content-Security-Policy
X-Content-Security-Policy
X-Webkit-CSP
{% endhighlight %}

These policies were applied to a test page that I set up that attempted to load different resources that violated the policies. The [page's HTML](https://github.com/tollmanz/report-only-capture/blob/9a52a5e6c71772953ddb7189fde5f2c61c4b3533/templates/csp.html) at the time of testing can be viewed on GitHub.

When reports were triggered, they were sent to an endpoint defined that grabbed the headers, POST body content, and query args (which contained the browser information) and recorded the data as a JSON object in a document database.

To collect the data, I used a combination of automated testing and manual page views. All of the tests were conducted using browsers through Browserstack's VMs. Ideally, I would collect CSP reports from every browser on every OS, but that was not practical given my resources. Instead, I focused on getting reports for as many browsers and browser version possible, without focusing on the OS that was used. I tested on different versions of OS X, Windows, Android and iOS. Most decisions in this regard were based on Browserstack features. I tended to prefer OS's that launched faster on Browserstack (OS X) and OS's that were more reliable in their testing environment (OS X and Windows). 

Unfortunately, due to Selenium [limitations](https://code.google.com/p/selenium/issues/detail?id=7640) and an unreliable tests, I could only test a handful of browsers automatically. Most notably, Firefox running under Selenium does not issue CSP violation reports. Additionally, I had problems with some browsers triggering fatal Selenium errors at the start of the test, which limited automated testing. Finally, Browserstack's "Live" testing features many more browsers than the "Automate" testing. I could not automate all tests due to lack of access to the browsers needed.

Manual testing involved painstakingly firing up a new VM and navigating the the CSP report triggering page in the VM. To Browserstack's credit, these VM launch incredibly fast (10 - 30 seconds in my experience). Each run would take 1-2 minutes to complete, but since this was an entirely manual process, it was a lot of work to complete a test run. Each test run required a specific URL per browser. The URL contained query args that identified the browser. This identifying information was essential so that a report could be associated with a specific browser as relying on user agent is notoriously difficult to do.

Reports were collected from the following browsers:

* Chrome 14.0 - 44.0
* Safari 5.1, 6.0, 6.1, 7.0, & 8.0 (OS X)
* Safari 5.1, 6.0, 7.0, 8.0, 9.0 (iOS)
* Opera 15.0 - 32.0
* Firefox 5.0 - 41.0
* Edge 0.11
* Android 4.4, 5.0

More browser versions and browsers were tested, but if they did not send a report, they were not included in the final sample because they produced no data. I did observe that some browsers (most notably IE 10 and 11) would adhere to the CSP directives, but not produce a report.

Each browser was tested twice; once with the CSP report URI using the same IP and port as the origin and a second test with the CSP report URI using the same IP and a different port than the origin. These two report URIs were used in order to observe differences between sending reports to different endpoints.

The test page used for generate the CSP reports set a cookie in the browser. I have previously observed differences in cookie handling [see footnote in "WordPress HTTPS Mixed Content Detector Plugin"](https://www.tollmanz.com/wordpress-https-mixed-content-detector/) and this is something I wanted to understand better.

## Results

In total 2,292 reports were observed. All reports were collected in a Couchbase database. A raw [JSON dump](https://raw.githubusercontent.com/tollmanz/report-only-capture/d79a3b89805611d5be3724144e1d24a403ef82b6/data/1439098258289/reports.json) of the data can be obtained on GitHub, or alternatively, can be [viewed in a tabular format](https://github.com/tollmanz/report-only-capture/tree/d79a3b89805611d5be3724144e1d24a403ef82b6/data/1439098258289) on GitHub. Note that when viewing this data, a field with `----` as its value means that the field was not set for the report. In other words, the browser did not send that field. If the value is empty (i.e., an empty string `''`), that means that the browser sent the field with the report, but the value was empty.

All browsers properly sent CSP violation reports as POST requests with a JSON payload. This POST request with a JSON payload was the only fully cross browser similarity that I observed. Most browsers, save for some older browsers, contained the `csp-report` property with individual report data as dictated by [CSP2 4.4](http://www.w3.org/TR/CSP2/#violation-reports); however, I cannot say that this was truly consistent across browsers.

Content Security Report violations varied widely across the spectrum of browsers tested. In total, 14 different properties were observed in the `csp-report` object:

* blocked-uri
* document-uri
* effective-directive
* original-policy
* referrer
* status-code
* violated-directive
* source-file
* line-number
* column-number
* request
* request-headers
* script-sample

Additionally, two properties were observed outside of the `csp-report` property:

* document-url
* violated-directive

`document-url` was observed to fill the same purpose of `document-uri`, but only ever appeared outside of the `csp-property` object and special care needs to be taken when handling this property.

The last four items in the list of properties are not specified by the CSP2 spec. Only one of the those four were observed in a modern browser, `script-sample`. Interestingly, I did not observe this as part of my core tests. Rather, I accidentally found discovered CSP report was triggered when using Firefox's Developer Tools to inspect elements in the DOM. This apparently triggered a script to execute and a CSP report to be sent.

The other three non-standard properties were observed in the following browsers:

* `request`, contained the full HTTP request string (e.g., `GET http://45.55.25.245:8123/csp?os=OS%20X&device=&browser_version=5.0&browser=firefox&os_version=Yosemite HTTP/1.1`); Firefox 5.0 - 13.0 
* `request-headers`: contains headers sent with request separated by new lines; Firefox 5.0 
* `document-url`: synonymous with `document-uri`; Safari 5.1, 6.1 (OS X), Safari 5.1, 6.0 (iOS);

## DONT FORGET TO REDO THE DATA TO VERIFY THE DOCUMENT URL STUFF!!!!!

The individual CSP report properties also varied depending on the browser. I will discuss properties that were implemented inconsistently across browsers. Any property not mentioned is assumed to be consistent across browsers.

**`blocked-uri`**

The `blocked-uri` directive varied primarily in the amount of information provided. The CSP2 spec [dictates](http://www.w3.org/TR/CSP2/#strip-uri-for-reporting) that this value needs to be "stripped" for reporting. It can have one of three variations:

1. `data` or `blob` or `filesystem`
2. `http://www.example.com/`
3. `http://www.example.com/resource`

If a `data`, `blob` or `filesystem` URI is the source of the violation, the spec indicates that only the word `data`, `blob` or `filesystem`. In no case should the resource actually be reported.

Every single version of Firefox tested (5.0 - 41.0) reported this incorrectly with regard to `data`. It reported the full data-URI encoded resource. It's worth noting that this can be particularly problematic for a CSP report collecting app as this can potentially send a significant amount of data (e.g., data-URI encoded fonts are not uncommon). All other browsers handled `data` properly. 

The spec further states that if the violating URI is from the same origin as the `document-uri`, the URI fragment can remain. If not, only the URI origin should be reported. Only Firefox did this incorrectly. For Firefox 5.0 - 41.0, it always reported the full URI, including the fragment, for every `blocked-uri` value. All other browsers that reported a `blocked-uri` (some older browsers didn't) correctly reported the URI with and without the fragment in the correct cases.

Interestingly, Firefox gives you more information than other browsers when reporting `blocked-uri`, but this is [highly](https://lists.w3.org/Archives/Public/public-webappsec/2014Feb/0081.html) [controversial](https://code.google.com/p/chromium/issues/detail?id=313737&thanks=313737&ts=1383237203). If you are expecting CSP reports, you are best to anticipate this overreporting and trim the extra information to conform to the CSP2 spec.

**`original-policy`**

If you look at the data collected, you will see that the `original-policy` values that were collected are highly consistent. This is indeed the case; however, I did notice and issue that I corrected relating to the use of the `'self'` keyword. When using `'self'`, browsers will treat the `original-policy` data differently. For instance, if your policy is `default-src 'self'` and your origin domain is `http://www.example.com`, the reported `original-policy` will either be `default-src 'self'` or `default-src http://www.example.com`. Some browsers translate `'self'` into the domain that `'self'` referred to at that time. This is worth noting as it can lead to confusion. For my tests, I ended up hard-coding the URI into the policy as it led to more consistent reporting and lessened some confusion I had about report inconsistencies (i.e., why is my policy different between test cases?).

**`referrer`**

Unfortunately, `referrer` was not properly tested. `referrer` has a value when a CSP report is triggered via an identifiable referrer. In my tests, I did not have any referrers trigger CSP reports because none the violating resources were caused by a referrer. This violation occurs when, for example, a non-violating script loads a resource that triggers a violation. The non-violating script is then passed as the referrer. I am actually only now realizing that I didn't properly evaluate this and will have to look into it another time.

**`violated-directive`**

The `violated-directive` property was very consistent across browsers with one small exception. In the same browsers that report the `document-url` ("url", not "uri") property, the `violated-directive` property is a directly attached to the main body JSON object, not part of the `csp-report` object. When dealing with these reports from those browsers, you must be careful to look for the property in the correct place.

**Request Headers**

In addition to seeing variation across the JSON payload sent, the request headers showed some important cross browser variation worth discussing.

In total, 17 different request headers were observed:

* host
* user-agent
* accept
* accept-language
* accept-encoding
* content-length
* content-type
* connection
* cookie
* referer
* cache-control
* origin
* x-requested-with
* accept-charset
* pragma
* ua-cpu
* x-forwarded-for

Like with the CSP report payload, I will only discuss noteworthy differences between browsers here.

**`cookie`**

Cookie handling was wildly different between browsers. The CSP2 spec's [only comment]() on the matter is (emphasis their's):

>  If the origin of *report URL* is **not** the same as the origin of the protected resource, the block cookies flag MUST also be set.

I interpret this to mean that cookies should only be set if `document-uri` shares the same origin as the CSP report URI. This sharing is sensible given that resource on the same origin should be able to share cookies.

The browsers that sent a cookie during testing were:

* Chrome 14.0 - 44.0
* Edge 0.11
* Firefox 9.0 - 14.0
* Safari 5.1, 6.0, 6.1, 7.0, & 8.0 (OS X)
* Safari 5.1, 6.0, 7.0, 8.0, 9.0 (iOS)
* Opera 15.0 - 32.0

Most notably, Firefox stopped sending any cookies since version 14.0. You simply cannot get cookies out of the report in Firefox.

As for other browsers, my tests were inconclusive as to whether they were treating cookies correctly or not. I varied the report URI by port number. I incorrectly thought that cookies were scoped to port; however, I have since learned that that is an [incorrect assumption](http://stackoverflow.com/questions/1612177/are-http-cookies-port-specific/4212964#4212964).

That said, I did collect some data on reporting to different ports and can at least comment on that. Here are a few things I learned:

* As of Chrome 28.0, if the report URI does not match the URI origin and port of the `document-uri`, cookies will not be sent. They are treating separate ports essentially as separate domains.
* All versions of Opera tested (15.0 - 32.0) must have a port match to send cookies.
* Firefox (9.0 - 14.0), Safari, and Edge will send cookies regardless of the port match.

I would like to test this again with different domains to see how the behavior changes; however, given the Firefox results, I feel confident in saying that without a change to Firefox, a CSP report collector should not depend on cookies as a major browser would be completely ignored.

**`content-type`**

CSP2 spec [states that CSP report requests](http://www.w3.org/TR/CSP2/#violation-reports) need to use a `content-type` header of `application/csp-report`. In my sample, I observed four different `content-type` headers:

* application/x-www-form-urlencoded
* application/json
* application/csp-report
* application/json; charset=UTF-8

Browsers that are sending the correct `application/csp-report` content-type include:

* Chrome 30.0 - 44.0
* Opera 17.0 - 32.0

Browsers that send the `application/json` or `application/json; charset=UTF-8` include:

* Safari 7.0, 8.0 (OS X)
* Safari 7.0, 8.0, 9.0 (iOS)
* Opera 15.0 - 16.0
* Firefox 5.0 - 41.0 (5.0 - 14.0 added `charset=UTF-8`)
* Chrome 21.0 - 29.0
* Edge 0.11

Finally, browsers that send the `application/x-www-form-urlencoded` content type are:

* Chrome 14.0 - 20.0
* Safari 5.1, 6.0, 6.1 (OS X)
* Safari 5.1, 6.0 (iOS)

Interestingly, in building a very naive collector, I had some troubles handling the `application/csp-report` content type. I used [Hapi](http://hapijs.com/) as a Node framework for building this collector, and I had to trick Hapi into thinking it was [dealing with JSON](https://www.tollmanz.com/hapi-415-unsupported-media-type/) in order for the application to properly handle the data. I know content negotiation is a tricky subject so beware of the `application/csp-report` content type with your individual server.

## Discussion

It is clear that different browsers handle CSP reports differently. On the bright side, almost all browsers that support CSP headers, will issue a CSP report (notable exception being IE 10 and 11). While not all browsers follow the CSP2 spec, with some transformations to the POSTed data, a normalized payload can be achieved. Most notably, care has to be taken to transform `blocked-uri`, alter reports without the `csp-report` property, avoid dependence on cookies, as well as properly handle the different content types sent to the collector.




Note: I really like how this article has "key" points: http://erik.io/blog/2014/03/04/definitive-guide-to-cookie-domains/. Since this will be a deep dive, having such a wrap up would be aces

* The 'self' keyword is a little tricky. It can be converted to the current domain in some reports. It also can lead to some confusion between dev environments. I personally like writing out the exact URL so it's clearer what I am blocked. Using 'self' confused me a number of times through these tests.

* Tip: Segment content with query vars
* Chrome used to send cookies, but now only sends cookies with an exact origin/port match
* Always set all directives for better categorization across browsers


Questions to answer:

1. What browsers support what features?
2. What are all of the different things that you need to support?
3. Are there groups for the different types of reports?

# Headers

**Content-Type**

**Cookies**



# Body


http://45.55.25.245:8123/csp?os=OS+X&device=&browser_version=9.0&browser=safari&os_version=El+Capitan

http://45.55.25.245:8123/csp?os=ios&device=&browser_version=9.0&browser=iphone&os_version=9.0
