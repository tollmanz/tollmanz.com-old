function BOOMR_check_doc_domain(t){var e;if(!t){if(window.parent===window||!document.getElementById("boomr-if-as"))return;t=document.domain}if(-1!==t.indexOf(".")){try{return void(e=window.parent.document)}catch(n){document.domain=t}try{return void(e=window.parent.document)}catch(n){t=t.replace(/^[\w\-]+\./,"")}BOOMR_check_doc_domain(t)}}BOOMR_start=(new Date).getTime(),BOOMR_check_doc_domain(),function(t){var e,n,r,i,o,a,s,d;t.parent!==t&&document.getElementById("boomr-if-as")&&"script"===document.getElementById("boomr-if-as").nodeName.toLowerCase()&&(t=t.parent,i=document.getElementById("boomr-if-as").src),r=t.document,t.BOOMR||(t.BOOMR={}),BOOMR=t.BOOMR,BOOMR.version||(BOOMR.version="0.9",BOOMR.window=t,BOOMR.plugins||(BOOMR.plugins={}),function(){try{void 0!==new t.CustomEvent("CustomEvent")&&(o=function(e,n){return new t.CustomEvent(e,n)})}catch(e){}try{!o&&r.createEvent&&r.createEvent("CustomEvent")&&(o=function(t,e){var n=r.createEvent("CustomEvent");return e=e||{cancelable:!1,bubbles:!1},n.initCustomEvent(t,e.bubbles,e.cancelable,e.detail),n})}catch(e){}!o&&r.createEventObject&&(o=function(t,e){var n=r.createEventObject();return n.type=n.propertyName=t,n.detail=e.detail,n}),o||(o=function(){return void 0})}(),a=function(t,e,n){function i(){r.dispatchEvent?r.dispatchEvent(a):r.fireEvent&&r.fireEvent("onpropertychange",a)}var a=o(t,{detail:e});a&&(n?BOOMR.setImmediate(i):i())},"undefined"!=typeof document.hidden?(s="visibilityState",d="visibilitychange"):"undefined"!=typeof document.mozHidden?(s="mozVisibilityState",d="mozvisibilitychange"):"undefined"!=typeof document.msHidden?(s="msVisibilityState",d="msvisibilitychange"):"undefined"!=typeof document.webkitHidden&&(s="webkitVisibilityState",d="webkitvisibilitychange"),e={beacon_url:"",beacon_type:"AUTO",site_domain:t.location.hostname.replace(/.*?([^.]+\.[^.]+)\.?$/,"$1").toLowerCase(),user_ip:"",strip_query_string:!1,onloadfired:!1,handlers_attached:!1,events:{page_ready:[],page_unload:[],before_unload:[],dom_loaded:[],visibility_changed:[],before_beacon:[],onbeacon:[],xhr_load:[],click:[],form_submit:[]},public_events:{before_beacon:"onBeforeBoomerangBeacon",onbeacon:"onBoomerangBeacon",onboomerangloaded:"onBoomerangLoaded"},vars:{},errors:{},disabled_plugins:{},xb_handler:function(n){return function(r){var i;r||(r=t.event),r.target?i=r.target:r.srcElement&&(i=r.srcElement),3===i.nodeType&&(i=i.parentNode),i&&"OBJECT"===i.nodeName.toUpperCase()&&"application/x-shockwave-flash"===i.type||e.fireEvent(n,i)}},fireEvent:function(t,e){var n,r,i;if(t=t.toLowerCase(),!this.events.hasOwnProperty(t))return!1;for(this.public_events.hasOwnProperty(t)&&a(this.public_events[t],e),i=this.events[t],n=0;n<i.length;n++)try{r=i[n],r.fn.call(r.scope,e,r.cb_data)}catch(o){BOOMR.addError(o,"fireEvent."+t+"<"+n+">")}return!0}},n={t_lstart:null,t_start:BOOMR_start,t_end:null,url:i,utils:{objectToString:function(t,e,n){var r,i=[];if(!t||"object"!=typeof t)return t;if(void 0===e&&(e="\n  "),n||(n=0),"[object Array]"===Object.prototype.toString.call(t)){for(r=0;r<t.length;r++)i.push(n>0&&null!==t[r]&&"object"==typeof t[r]?this.objectToString(t[r],e+("\n "===e?" ":""),n-1):"&"===e?encodeURIComponent(t[r]):t[r]);e=","}else for(r in t)Object.prototype.hasOwnProperty.call(t,r)&&i.push(n>0&&null!==t[r]&&"object"==typeof t[r]?encodeURIComponent(r)+"="+this.objectToString(t[r],e+("\n "===e?" ":""),n-1):"&"===e?encodeURIComponent(r)+"="+encodeURIComponent(t[r]):r+"="+t[r]);return i.join(e)},getCookie:function(t){if(!t)return null;t=" "+t+"=";var e,n;return n=" "+r.cookie+";",(e=n.indexOf(t))>=0?(e+=t.length,n=n.substring(e,n.indexOf(";",e))):null},setCookie:function(t,n,i){var o,a,s,d,u;if(!t||!e.site_domain)return BOOMR.debug("No cookie name or site domain: "+t+"/"+e.site_domain),!1;if(o=this.objectToString(n,"&"),a=t+"="+o,d=[a,"path=/","domain="+e.site_domain],i&&(u=new Date,u.setTime(u.getTime()+1e3*i),u=u.toGMTString(),d.push("expires="+u)),a.length<500){if(r.cookie=d.join("; "),s=this.getCookie(t),o===s)return!0;BOOMR.warn("Saved cookie value doesn't match what we tried to set:\n"+o+"\n"+s)}else BOOMR.warn("Cookie too long: "+a.length+" "+a);return!1},getSubCookies:function(t){var e,n,r,i,o=!1,a={};if(!t)return null;if("string"!=typeof t)return BOOMR.debug("TypeError: cookie is not a string: "+typeof t),null;for(e=t.split("&"),n=0,r=e.length;r>n;n++)i=e[n].split("="),i[0]&&(i.push(""),a[decodeURIComponent(i[0])]=decodeURIComponent(i[1]),o=!0);return o?a:null},removeCookie:function(t){return this.setCookie(t,{},-86400)},cleanupURL:function(t){return t?e.strip_query_string?t.replace(/\?.*/,"?qs-redacted"):t:""},hashQueryString:function(t,e){return t?t.match?(t.match(/^\/\//)&&(t=location.protocol+t),t.match(/^(https?|file):/)?(e&&(t=t.replace(/#.*/,"")),BOOMR.utils.MD5?t.replace(/\?([^#]*)/,function(t,e){return"?"+(e.length>10?BOOMR.utils.MD5(e):e)}):t):(BOOMR.error("Passed in URL is invalid: "+t),"")):(BOOMR.addError("TypeError: Not a string","hashQueryString",typeof t),""):t},pluginConfig:function(t,e,n,r){var i,o=0;if(!e||!e[n])return!1;for(i=0;i<r.length;i++)void 0!==e[n][r[i]]&&(t[r[i]]=e[n][r[i]],o++);return o>0},addObserver:function(t,e,n,r,i,o){function a(t){var e=!1;s.timer&&(clearTimeout(s.timer),s.timer=null),r&&(e=r.call(o,t,i),e||(r=null)),!e&&s.observer&&(s.observer.disconnect(),s.observer=null),"number"==typeof e&&e>0&&(s.timer=setTimeout(a,e))}var s={observer:null,timer:null};return window.MutationObserver&&r&&t?(s.observer=new MutationObserver(a),n&&(s.timer=setTimeout(a,s.timeout)),s.observer.observe(t,e),s):null},addListener:function(t,e,n){t.addEventListener?t.addEventListener(e,n,!1):t.attachEvent&&t.attachEvent("on"+e,n)},removeListener:function(t,e,n){t.removeEventListener?t.removeEventListener(e,n,!1):t.detachEvent&&t.detachEvent("on"+e,n)},pushVars:function(t,e,n){var r,i,o,a=0;for(r in e)if(e.hasOwnProperty(r))if("[object Array]"===Object.prototype.toString.call(e[r]))for(i=0;i<e[r].length;++i)a+=BOOMR.utils.pushVars(t,e[r][i],r+"["+i+"]");else o=document.createElement("input"),o.type="hidden",o.name=n?n+"["+r+"]":r,o.value=void 0===e[r]||null===e[r]?"":e[r],t.appendChild(o),a+=encodeURIComponent(o.name).length+encodeURIComponent(o.value).length+2;return a},sendData:function(t,n){function r(t){var e=document.getElementById(t);e&&e.parentNode.removeChild(e)}function i(){var e,n="boomerang_post-"+encodeURIComponent(t.action)+"-"+Math.random();try{e=document.createElement('<iframe name="'+n+'">')}catch(a){e=document.createElement("iframe")}t.action=o.shift(),t.target=e.name=e.id=n,e.style.display=t.style.display="none",e.src="javascript:false",r(e.id),r(t.id),document.body.appendChild(e),document.body.appendChild(t),t.submit(),o.length&&BOOMR.setImmediate(i),setTimeout(function(){r(e.id)},1e4)}var o=(document.createElement("input"),[e.beacon_url]);t.method=n,t.id="beacon_form",t.enctype="application/x-www-form-urlencoded",e.secondary_beacons&&e.secondary_beacons.length&&o.push.apply(o,e.secondary_beacons),i()}},init:function(n){var i,o,a=["beacon_url","beacon_type","site_domain","user_ip","strip_query_string","secondary_beacons"];for(BOOMR_check_doc_domain(),n||(n={}),i=0;i<a.length;i++)void 0!==n[a[i]]&&(e[a[i]]=n[a[i]]);void 0!==n.log&&(this.log=n.log),this.log||(this.log=function(){});for(o in this.plugins)if(this.plugins.hasOwnProperty(o)){if(n[o]&&n[o].hasOwnProperty("enabled")&&n[o].enabled===!1){e.disabled_plugins[o]=1;continue}if(e.disabled_plugins[o]){if(!n[o]||!n[o].hasOwnProperty("enabled")||n[o].enabled!==!0)continue;delete e.disabled_plugins[o]}if("function"==typeof this.plugins[o].init)try{this.plugins[o].init(n)}catch(s){BOOMR.addError(s,o+".init")}}return e.handlers_attached?this:(e.onloadfired||void 0!==n.autorun&&n.autorun===!1||(r.readyState&&"complete"===r.readyState?(BOOMR.loadedLate=!0,this.setImmediate(BOOMR.page_ready,null,null,BOOMR)):t.onpagehide||null===t.onpagehide?BOOMR.utils.addListener(t,"pageshow",BOOMR.page_ready):BOOMR.utils.addListener(t,"load",BOOMR.page_ready)),BOOMR.utils.addListener(t,"DOMContentLoaded",function(){e.fireEvent("dom_loaded")}),function(){var n,i;for(void 0!==d&&(BOOMR.utils.addListener(r,d,function(){e.fireEvent("visibility_changed")}),BOOMR.subscribe("visibility_changed",function(){BOOMR.lastVisibilityEvent[BOOMR.visibilityState()]=BOOMR.now()})),BOOMR.utils.addListener(r,"mouseup",e.xb_handler("click")),n=r.getElementsByTagName("form"),i=0;i<n.length;i++)BOOMR.utils.addListener(n[i],"submit",e.xb_handler("form_submit"));t.onpagehide||null===t.onpagehide||BOOMR.utils.addListener(t,"unload",function(){BOOMR.window=t=null})}(),e.handlers_attached=!0,this)},page_ready:function(n){return n||(n=t.event),n||(n={name:"load"}),e.onloadfired?this:(e.fireEvent("page_ready",n),e.onloadfired=!0,this)},setImmediate:function(e,n,r,i){var o=function(){e.call(i||null,n,r||{}),o=null};t.setImmediate?t.setImmediate(o):t.msSetImmediate?t.msSetImmediate(o):t.webkitSetImmediate?t.webkitSetImmediate(o):t.mozSetImmediate?t.mozSetImmediate(o):setTimeout(o,10)},now:function(){try{if("performance"in window&&window.performance&&window.performance.now)return function(){return Math.round(window.performance.now()+window.performance.timing.navigationStart)}}catch(t){}return Date.now||function(){return(new Date).getTime()}}(),visibilityState:void 0===s?function(){return"visible"}:function(){return r[s]},lastVisibilityEvent:{},subscribe:function(n,r,i,o){var a,s,d,u;if(n=n.toLowerCase(),!e.events.hasOwnProperty(n))return this;for(d=e.events[n],a=0;a<d.length;a++)if(s=d[a],s&&s.fn===r&&s.cb_data===i&&s.scope===o)return this;return d.push({fn:r,cb_data:i||{},scope:o||null}),"page_ready"===n&&e.onloadfired&&this.setImmediate(r,null,i,o),("page_unload"===n||"before_unload"===n)&&(u=function(e){r&&r.call(o,e||t.event,i)},"page_unload"===n&&(t.onpagehide||null===t.onpagehide?BOOMR.utils.addListener(t,"pagehide",u):BOOMR.utils.addListener(t,"unload",u)),BOOMR.utils.addListener(t,"beforeunload",u)),this},addError:function(t,n,r){var i;"string"!=typeof t&&(i=String(t),i.match(/^\[object/)&&(i=t.name+": "+(t.description||t.message).replace(/\r\n$/,"")),t=i),void 0!==n&&(t="["+n+":"+BOOMR.now()+"] "+t),r&&(t+=":: "+r),e.errors[t]?e.errors[t]++:e.errors[t]=1},addVar:function(t,n){if("string"==typeof t)e.vars[t]=n;else if("object"==typeof t){var r,i=t;for(r in i)i.hasOwnProperty(r)&&(e.vars[r]=i[r])}return this},removeVar:function(t){var n,r;if(!arguments.length)return this;for(r=1===arguments.length&&"[object Array]"===Object.prototype.toString.apply(t)?t:arguments,n=0;n<r.length;n++)e.vars.hasOwnProperty(r[n])&&delete e.vars[r[n]];return this},hasVar:function(t){return e.vars.hasOwnProperty(t)},requestStart:function(t){var e=BOOMR.now();return BOOMR.plugins.RT.startTimer("xhr_"+t,e),{loaded:function(n){BOOMR.responseEnd(t,e,n)}}},responseEnd:function(t,n,r){"object"==typeof t&&t.url?e.fireEvent("xhr_load",t):(BOOMR.plugins.RT.startTimer("xhr_"+t,n),e.fireEvent("xhr_load",{name:"xhr_"+t,data:r}))},sendBeacon:function(){var n,i,o,a=[];BOOMR.debug("Checking if we can send beacon");for(n in this.plugins)if(this.plugins.hasOwnProperty(n)){if(e.disabled_plugins[n])continue;if(!this.plugins[n].is_complete())return BOOMR.debug("Plugin "+n+" is not complete, deferring beacon send"),!1}e.vars.pgu=BOOMR.utils.cleanupURL(r.URL.replace(/#.*/,"")),e.vars.u||(e.vars.u=e.vars.pgu),e.vars.pgu===e.vars.u&&delete e.vars.pgu,e.vars.v=BOOMR.version,BOOMR.visibilityState()&&(e.vars["vis.st"]=BOOMR.visibilityState(),BOOMR.lastVisibilityEvent.visible&&(e.vars["vis.lv"]=BOOMR.now()-BOOMR.lastVisibilityEvent.visible),BOOMR.lastVisibilityEvent.hidden&&(e.vars["vis.lh"]=BOOMR.now()-BOOMR.lastVisibilityEvent.hidden)),t!==window&&(e.vars["if"]="");for(n in e.errors)e.errors.hasOwnProperty(n)&&a.push(n+(e.errors[n]>1?" (*"+e.errors[n]+")":""));return a.length>0&&(e.vars.errors=a.join("\n")),e.errors={},e.fireEvent("before_beacon",e.vars),BOOMR.debug("Ready to send beacon: "+BOOMR.utils.objectToString(e.vars)),e.beacon_url?(i=document.createElement("form"),o=BOOMR.utils.pushVars(i,e.vars),e.fireEvent("onbeacon",e.vars),o?(BOOMR.utils.sendData(i,"AUTO"===e.beacon_type?o>2e3?"POST":"GET":"POST"),!0):this):(BOOMR.debug("No beacon URL, so skipping."),!0)}},delete BOOMR_start,"number"==typeof BOOMR_lstart?(n.t_lstart=BOOMR_lstart,delete BOOMR_lstart):"number"==typeof BOOMR.window.BOOMR_lstart&&(n.t_lstart=BOOMR.window.BOOMR_lstart),function(){var t;"object"==typeof console&&void 0!==console.log&&(n.log=function(t,e,n){console.log(n+": ["+e+"] "+t)}),t=function(t){return function(e,n){return this.log(e,t,"boomerang"+(n?"."+n:"")),this}},n.debug=t("debug"),n.info=t("info"),n.warn=t("warn"),n.error=t("error")}(),function(){var t;for(t in n)n.hasOwnProperty(t)&&(BOOMR[t]=n[t]);BOOMR.xhr_excludes||(BOOMR.xhr_excludes={})}(),a("onBoomerangLoaded",{BOOMR:BOOMR},!0))}(window),function(){if(BOOMR=BOOMR||{},BOOMR.plugins=BOOMR.plugins||{},!BOOMR.plugins.NavigationTiming){var t={complete:!1,xhr_done:function(e){var n,r,i=BOOMR.window,o={};if(e){if(e.data&&(e=e.data),e.url&&i.performance&&i.performance.getEntriesByName&&(n=i.performance.getEntriesByName(e.url),n&&n.length>0)){n=n[0],o={nt_red_st:n.redirectStart,nt_red_end:n.redirectEnd,nt_fet_st:n.fetchStart,nt_dns_st:n.domainLookupStart,nt_dns_end:n.domainLookupEnd,nt_con_st:n.connectStart,nt_con_end:n.connectEnd,nt_req_st:n.requestStart,nt_res_st:n.responseStart,nt_res_end:n.responseEnd},n.secureConnectionStart&&(o.nt_ssl_st=n.secureConnectionStart);for(r in o)o.hasOwnProperty(r)&&o[r]&&(o[r]+=i.performance.timing.navigationStart)}e.timing&&(n=e.timing,o.nt_req_st||(o.nt_req_st=n.requestStart),o.nt_res_st||(o.nt_res_st=n.responseStart),o.nt_res_end||(o.nt_res_end=n.responseEnd),o.nt_domint=n.domInteractive,o.nt_domcomp=n.domComplete,o.nt_load_st=n.loadEventEnd,o.nt_load_end=n.loadEventEnd);for(r in o)o.hasOwnProperty(r)&&!o[r]&&delete o[r];BOOMR.addVar(o);try{t.addedVars.push.apply(t.addedVars,Object.keys(o))}catch(a){}this.complete=!0,BOOMR.sendBeacon()}},done:function(){var e,n,r,i,o=BOOMR.window;if(this.complete)return this;if(t.addedVars=[],e=o.performance||o.msPerformance||o.webkitPerformance||o.mozPerformance,e&&e.timing&&e.navigation){BOOMR.info("This user agent supports NavigationTiming.","nt"),n=e.navigation,r=e.timing,i={nt_red_cnt:n.redirectCount,nt_nav_type:n.type,nt_nav_st:r.navigationStart,nt_red_st:r.redirectStart,nt_red_end:r.redirectEnd,nt_fet_st:r.fetchStart,nt_dns_st:r.domainLookupStart,nt_dns_end:r.domainLookupEnd,nt_con_st:r.connectStart,nt_con_end:r.connectEnd,nt_req_st:r.requestStart,nt_res_st:r.responseStart,nt_res_end:r.responseEnd,nt_domloading:r.domLoading,nt_domint:r.domInteractive,nt_domcontloaded_st:r.domContentLoadedEventStart,nt_domcontloaded_end:r.domContentLoadedEventEnd,nt_domcomp:r.domComplete,nt_load_st:r.loadEventStart,nt_load_end:r.loadEventEnd,nt_unload_st:r.unloadEventStart,nt_unload_end:r.unloadEventEnd},r.secureConnectionStart&&(i.nt_ssl_st=r.secureConnectionStart),r.msFirstPaint&&(i.nt_first_paint=r.msFirstPaint),BOOMR.addVar(i);try{t.addedVars.push.apply(t.addedVars,Object.keys(i))}catch(a){}}if(o.chrome&&o.chrome.loadTimes&&(r=o.chrome.loadTimes())){i={nt_spdy:r.wasFetchedViaSpdy?1:0,nt_cinf:r.connectionInfo,nt_first_paint:r.firstPaintTime},BOOMR.addVar(i);try{t.addedVars.push.apply(t.addedVars,Object.keys(i))}catch(a){}}this.complete=!0,BOOMR.sendBeacon()},clear:function(){t.addedVars&&t.addedVars.length>0&&(BOOMR.removeVar(t.addedVars),t.addedVars=[]),this.complete=!1}};BOOMR.plugins.NavigationTiming={init:function(){return t.initialized||(BOOMR.subscribe("page_ready",t.done,null,t),BOOMR.subscribe("xhr_load",t.xhr_done,null,t),BOOMR.subscribe("before_unload",t.done,null,t),BOOMR.subscribe("onbeacon",t.clear,null,t),t.initialized=!0),this},is_complete:function(){return t.complete}}}}(),function(t){var e,n=t.document;BOOMR=BOOMR||{},BOOMR.plugins=BOOMR.plugins||{},BOOMR.plugins.RT||(e={onloadfired:!1,unloadfired:!1,visiblefired:!1,initialized:!1,complete:!1,timers:{},cookie:"RT",cookie_exp:600,strict_referrer:!0,navigationType:0,navigationStart:void 0,responseStart:void 0,t_start:void 0,cached_t_start:void 0,t_fb_approx:void 0,r:void 0,r2:void 0,basic_timers:{t_done:1,t_resp:1,t_page:1},addedVars:[],updateCookie:function(t,e){var n,r,i,o;if(!this.cookie)return!1;if(i=BOOMR.utils.getSubCookies(BOOMR.utils.getCookie(this.cookie))||{},"object"==typeof t)for(o in t)t.hasOwnProperty(o)&&(void 0===t[o]?i.hasOwnProperty(o)&&delete i[o]:(("nu"===o||"r"===o)&&(t[o]=BOOMR.utils.hashQueryString(t[o],!0)),i[o]=t[o]));return r=BOOMR.now(),e&&(i[e]=r),BOOMR.debug("Setting cookie (timer="+e+")\n"+BOOMR.utils.objectToString(i),"rt"),BOOMR.utils.setCookie(this.cookie,i,this.cookie_exp)?(n=BOOMR.now(),n-r>50&&(BOOMR.utils.removeCookie(this.cookie),BOOMR.error("took more than 50ms to set cookie... aborting: "+r+" -> "+n,"rt")),!0):(BOOMR.error("cannot set start cookie","rt"),!1)},initFromCookie:function(){var t,e;e=BOOMR.utils.getSubCookies(BOOMR.utils.getCookie(this.cookie)),e&&(e.s=Math.max(+e.ul||0,+e.cl||0),BOOMR.debug("Read from cookie "+BOOMR.utils.objectToString(e),"rt"),e.s&&(e.r||e.nu)&&(this.r=e.r,t=BOOMR.utils.hashQueryString(n.URL,!0),BOOMR.debug(this.r+" =?= "+this.r2,"rt"),BOOMR.debug(e.s+" <? "+(+e.cl+15),"rt"),BOOMR.debug(e.nu+" =?= "+t,"rt"),!this.strict_referrer||e.nu&&e.nu===t&&e.s<+e.cl+15||e.s===+e.ul&&this.r===this.r2?(this.t_start=e.s,+e.hd>e.s&&(this.t_fb_approx=parseInt(e.hd,10))):this.t_start=this.t_fb_approx=void 0),this.updateCookie({s:void 0,r:void 0,nu:void 0,ul:void 0,cl:void 0,hd:void 0}))},getBoomerangTimings:function(){function t(t,e){var n=Math.round(t?t:0),r=Math.round(e?e:0);return n=0===n?0:n-r,n?n:""}var n,r,i,o,a;BOOMR.t_start&&(BOOMR.plugins.RT.startTimer("boomerang",BOOMR.t_start),BOOMR.plugins.RT.endTimer("boomerang",BOOMR.t_end),BOOMR.plugins.RT.endTimer("boomr_fb",BOOMR.t_start),BOOMR.t_lstart&&(BOOMR.plugins.RT.endTimer("boomr_ld",BOOMR.t_lstart),BOOMR.plugins.RT.setTimer("boomr_lat",BOOMR.t_start-BOOMR.t_lstart)));try{if(window.performance&&window.performance.getEntriesByName){r={"rt.bmr":BOOMR.url};for(i in r)if(r.hasOwnProperty(i)&&r[i]){if(n=window.performance.getEntriesByName(r[i]),!n||0===n.length)continue;n=n[0],o=t(n.startTime,0),a=[o,t(n.responseEnd,o),t(n.responseStart,o),t(n.requestStart,o),t(n.connectEnd,o),t(n.secureConnectionStart,o),t(n.connectStart,o),t(n.domainLookupEnd,o),t(n.domainLookupStart,o),t(n.redirectEnd,o),t(n.redirectStart,o)].join(",").replace(/,+$/,""),BOOMR.addVar(i,a),e.addedVars.push(i)}}}catch(s){BOOMR.addError(s,"rt.getBoomerangTimings")}},checkPreRender:function(){return"prerender"!==BOOMR.visibilityState()?!1:(BOOMR.plugins.RT.startTimer("t_load",this.navigationStart),BOOMR.plugins.RT.endTimer("t_load"),BOOMR.plugins.RT.startTimer("t_prerender",this.navigationStart),BOOMR.plugins.RT.startTimer("t_postrender"),!0)},initFromNavTiming:function(){var e,n,r;this.navigationStart||(n=t.performance||t.msPerformance||t.webkitPerformance||t.mozPerformance,n&&n.navigation&&(this.navigationType=n.navigation.type),n&&n.timing?e=n.timing:t.chrome&&t.chrome.csi&&t.chrome.csi().startE?(e={navigationStart:t.chrome.csi().startE},r="csi"):t.gtbExternal&&t.gtbExternal.startE()&&(e={navigationStart:t.gtbExternal.startE()},r="gtb"),e?(BOOMR.addVar("rt.start",r||"navigation"),this.navigationStart=e.navigationStart||e.fetchStart||void 0,this.responseStart=e.responseStart||void 0,navigator.userAgent.match(/Firefox\/[78]\./)&&(this.navigationStart=e.unloadEventStart||e.fetchStart||void 0)):BOOMR.warn("This browser doesn't support the WebTiming API","rt"))},validateLoadTimestamp:function(e,n){var r=e;return n&&n.timing&&n.timing.loadEventEnd?r=n.timing.loadEventEnd:BOOMR.loadedLate&&(t.performance&&t.performance.timing?t.performance.timing.loadEventStart&&t.performance.timing.loadEventStart<BOOMR.t_end&&(r=t.performance.timing.loadEventStart):r=BOOMR.t_lstart||BOOMR.t_start||e),r},setPageLoadTimers:function(t,n,r){var i;return"xhr"!==t&&(e.initFromCookie(),e.initFromNavTiming(),e.checkPreRender())?!1:("xhr"===t?r&&r.timing&&(i=r.timing.responseStart):e.responseStart?i=e.responseStart:e.timers.hasOwnProperty("t_page")?BOOMR.plugins.RT.endTimer("t_page"):e.t_fb_approx&&(i=e.t_fb_approx),i&&(BOOMR.plugins.RT.endTimer("t_resp",i),e.timers.t_load?BOOMR.plugins.RT.setTimer("t_page",e.timers.t_load.end-i):BOOMR.plugins.RT.setTimer("t_page",n-i)),e.timers.hasOwnProperty("t_postrender")&&(BOOMR.plugins.RT.endTimer("t_postrender"),BOOMR.plugins.RT.endTimer("t_prerender")),!0)},setSupportingTimestamps:function(t){t&&BOOMR.addVar("rt.tstart",t),"number"==typeof e.t_start&&e.t_start!==t&&BOOMR.addVar("rt.cstart",e.t_start),BOOMR.addVar("rt.bstart",BOOMR.t_start),BOOMR.t_lstart&&BOOMR.addVar("rt.blstart",BOOMR.t_lstart),BOOMR.addVar("rt.end",e.timers.t_done.end)},determineTStart:function(t,n){var r;return"xhr"===t?(n&&n.name&&e.timers[n.name]?r=e.timers[n.name].start:n&&n.timing&&n.timing.requestStart&&(r=n.timing.requestStart),BOOMR.addVar("rt.start","manual")):e.navigationStart?r=e.navigationStart:e.t_start&&2!==e.navigationType?(r=e.t_start,BOOMR.addVar("rt.start","cookie")):e.cached_t_start?r=e.cached_t_start:(BOOMR.addVar("rt.start","none"),r=void 0),BOOMR.debug("Got start time: "+r,"rt"),e.cached_t_start=r,r},page_ready:function(){this.onloadfired=!0},check_visibility:function(){"visible"===BOOMR.visibilityState()&&(e.visiblefired=!0),"prerender"===e.visibilityState&&"prerender"!==BOOMR.visibilityState()&&BOOMR.plugins.RT.done(null,"visible"),e.visibilityState=BOOMR.visibilityState()},page_unload:function(t){BOOMR.debug("Unload called with "+BOOMR.utils.objectToString(t)+" when unloadfired = "+this.unloadfired,"rt"),this.unloadfired||BOOMR.plugins.RT.done(t,"unload"),this.updateCookie({r:n.URL},"beforeunload"===t.type?"ul":"hd"),this.unloadfired=!0},_iterable_click:function(t,n,r,i){var o;if(r){for(BOOMR.debug(t+" called with "+r.nodeName,"rt");r&&r.nodeName.toUpperCase()!==n;)r=r.parentNode;r&&r.nodeName.toUpperCase()===n&&(BOOMR.debug("passing through","rt"),o=i(r),this.updateCookie({nu:o},"cl"),BOOMR.addVar("nu",BOOMR.utils.cleanupURL(o)),e.addedVars.push("nu"))}},onclick:function(t){e._iterable_click("Click","A",t,function(t){return t.href})},onsubmit:function(t){e._iterable_click("Submit","FORM",t,function(t){var e=t.getAttribute("action")||n.URL||"";return e.match(/\?/)?e:e+"?"})},domloaded:function(){BOOMR.plugins.RT.endTimer("t_domloaded")},clear:function(){e.addedVars&&e.addedVars.length>0&&(BOOMR.removeVar(e.addedVars),e.addedVars=[])}},BOOMR.plugins.RT={init:function(r){return BOOMR.debug("init RT","rt"),t!==BOOMR.window&&(t=BOOMR.window),n=t.document,BOOMR.utils.pluginConfig(e,r,"RT",["cookie","cookie_exp","strict_referrer"]),e.r=e.r2=BOOMR.utils.hashQueryString(n.referrer,!0),e.initFromCookie(),e.getBoomerangTimings(),e.initialized?this:(e.complete=!1,e.timers={},e.check_visibility(),BOOMR.subscribe("page_ready",e.page_ready,null,e),BOOMR.subscribe("visibility_changed",e.check_visibility,null,e),BOOMR.subscribe("page_ready",this.done,"load",this),BOOMR.subscribe("xhr_load",this.done,"xhr",this),BOOMR.subscribe("dom_loaded",e.domloaded,null,e),BOOMR.subscribe("page_unload",e.page_unload,null,e),BOOMR.subscribe("click",e.onclick,null,e),BOOMR.subscribe("form_submit",e.onsubmit,null,e),BOOMR.subscribe("before_beacon",this.addTimersToBeacon,"beacon",this),BOOMR.subscribe("onbeacon",e.clear,null,e),e.initialized=!0,this)},startTimer:function(t,n){return t&&("t_page"===t&&this.endTimer("t_resp",n),e.timers[t]={start:"number"==typeof n?n:BOOMR.now()}),this},endTimer:function(t,n){return t&&(e.timers[t]=e.timers[t]||{},void 0===e.timers[t].end&&(e.timers[t].end="number"==typeof n?n:BOOMR.now())),this},setTimer:function(t,n){return t&&(e.timers[t]={delta:n}),this},addTimersToBeacon:function(t,n){var r,i,o=[];for(r in e.timers)if(e.timers.hasOwnProperty(r)){if(i=e.timers[r],"number"!=typeof i.delta&&("number"!=typeof i.start&&(i.start=e.cached_t_start),i.delta=i.end-i.start),isNaN(i.delta))continue;e.basic_timers.hasOwnProperty(r)?(BOOMR.addVar(r,i.delta),e.addedVars.push(r)):o.push(r+"|"+i.delta)}o.length&&(BOOMR.addVar("t_other",o.join(",")),e.addedVars.push("t_other")),"beacon"===n&&(e.timers={},e.complete=!1)},done:function(t,n){try{BOOMR.debug("Called done with "+BOOMR.utils.objectToString(t,void 0,1)+", "+n,"rt")}catch(r){BOOMR.debug("Called done with "+r+", "+n,"rt")}var i,o,a=BOOMR.now(),s=!1;return e.complete=!1,o=e.validateLoadTimestamp(a,t),"load"!==n&&"visible"!==n&&"xhr"!==n||e.setPageLoadTimers(n,o,t)?(i=e.determineTStart(n,t),t&&t.data&&(t=t.data),"xhr"===n&&t&&(s=t.subresource),this.endTimer("t_done",o),BOOMR.removeVar("t_done","t_page","t_resp","t_postrender","t_prerender","t_load","t_other","r","r2","rt.tstart","rt.cstart","rt.bstart","rt.end","rt.subres","rt.abld","http.errno","http.method","xhr.sync"),e.setSupportingTimestamps(i),this.addTimersToBeacon(),BOOMR.addVar("r",BOOMR.utils.cleanupURL(e.r)),e.r2!==e.r&&BOOMR.addVar("r2",BOOMR.utils.cleanupURL(e.r2)),"xhr"===n&&t&&t&&t.data&&(t=t.data),"xhr"===n&&t&&(s=t.subresource,t.url&&(BOOMR.addVar("u",BOOMR.utils.cleanupURL(t.url.replace(/#.*/,""))),e.addedVars.push("u")),t.status&&(t.status<-1||t.status>=400)&&BOOMR.addVar("http.errno",t.status),t.method&&"GET"!==t.method&&BOOMR.addVar("http.method",t.method),t.headers&&BOOMR.addVar("http.hdr",t.headers),t.synchronous&&BOOMR.addVar("xhr.sync",1),t.initiator&&BOOMR.addVar("http.initiator",t.initiator),e.addedVars.push("http.errno","http.method","http.hdr","xhr.sync","http.initiator")),s&&(BOOMR.addVar("rt.subres",1),e.addedVars.push("rt.subres")),e.updateCookie(),"unload"===n&&(BOOMR.addVar("rt.quit",""),e.onloadfired||BOOMR.addVar("rt.abld",""),e.visiblefired||BOOMR.addVar("rt.ntvu","")),e.complete=!0,BOOMR.sendBeacon(),this):this},is_complete:function(){return e.complete}})}(window),BOOMR.t_end=(new Date).getTime(),BOOMR.init({beacon_url:"/beacon"});
