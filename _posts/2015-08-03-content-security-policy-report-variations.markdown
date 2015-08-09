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

{% highlight %}
default-src https://localhost:8123/; child-src https://localhost:8123/; connect-src https://localhost:8123/; font-src https://localhost:8123/; img-src https://localhost:8123/; media-src https://localhost:8123/; object-src https://localhost:8123/; script-src https://localhost:8123/; style-src https://localhost:8123/; form-action https://localhost:8123/; frame-ancestors 'none'; plugin-types 'none'; report-uri http://localhost:8123/csp-report
{% endhighlight %}

This value was set for 3 different headers in order to capture reports for older browsers:

{% highlight %}
Content-Security-Policy
X-Content-Security-Policy
X-Webkit-CSP
{% endhighlight %}

These policies were applied to a test page that I set up that attempted to load different resources that violated the policies. The [page's HTML](https://github.com/tollmanz/report-only-capture/blob/9a52a5e6c71772953ddb7189fde5f2c61c4b3533/templates/csp.html) at the time of testing can be viewed on GitHub.

When reports were triggered, they were sent to an endpoint defined that grabbed the headers, POST body content, and query args (which contained the browser information) and recorded the data as a JSON object in a document database. A raw [JSON dump](https://raw.githubusercontent.com/tollmanz/report-only-capture/d79a3b89805611d5be3724144e1d24a403ef82b6/data/1439098258289/reports.json) of the data can be obtained on GitHub, or alternatively, can be [viewed in a tabular format](https://github.com/tollmanz/report-only-capture/tree/d79a3b89805611d5be3724144e1d24a403ef82b6/data/1439098258289) on GitHub. 

To collect the data, I used a combination of automated testing and manual page views. All of the tests were conducted using browsers through Browserstack's VMs. Ideally, I would collect CSP reports from every browser on every OS, but that was not practical given my resources. Instead, I focused on getting reports for as many browsers and browser version possible, without focusing on the OS that was used. I tested on different versions of OS X, Windows, Android and iOS. Most decisions in this regard were based on Browserstack features. I tended to prefer OS's that launched faster on Browserstack (OS X) and OS's that were more reliable in their testing environment (OS X and Windows). 

Unfortunately, due to Selenium [limitations](https://code.google.com/p/selenium/issues/detail?id=7640) and an unreliable tests, I could only test a handful of browsers automatically. Most notably, Firefox running under Selenium does not issue CSP violation reports. 




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
