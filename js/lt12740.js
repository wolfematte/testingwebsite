(function() {
  var lt = window.lt;
  lt.d = document;
  lt.w = window;

  if(lt._v) return;

  lt._v = '1.2';
  lt.__config__ = {
    server: {
      u: '//u.ltrck.com.br/u',
      pv: '//r.ltrck.com.br/pv',
      lz: '//r.ltrck.com.br/lz',
      sync: '//r.ltrck.com.br/sync',
      tag: '//tag.ltrck.com.br/',
      cpl: '//r.ltrck.com.br/cpl',
      e: '//u.ltrck.com.br/e'
    },
    campaign_fields: ['gcm', 'gag', 'gac', 'gne', 'fcm', 'fag', 'fac', 'fne']
  };
  lt.accs = [];


  lt.__init__ = function(){
    this.dom = this.__get_TLD();
    this.ltuid = this.__get_cookie('_ltuid');
    if(this.pvid) return;
    this.pvid = new Date().getTime();
    this.__url_params__ = this.__get_params();
    this.__cpls_status = {};

    var c = this._c.slice();

    this._c.push = function(arr) {
      lt.__proc_cmd(arr[0], arr[1]);
    };

    for(var x=0; x<c.length;x++){
      lt.__proc_cmd(c[x][0], c[x][1]);
    }
  };

  lt.__proc_cmd = function(k, v){
    if(k=='init') {
      var acc = lt.b62.decode(v.split("-")[0]);
      if(this.accs.indexOf(acc)>=0) return;
      this.accs.push(acc);


      if(this.ltuid) {
        this.__register_pv(acc);
        this.__check_inputs(acc);
      }
      else
        this.__create_user_id();
    }
    else if(k=='event'){
      this.__register_event(v);
    }
  };

  lt.__create_user_id = function(){
    var params = "?";
    params += "new=1";
    params += '&v='+this._v;
    this.__include(this.__config__.server.u + params);

  };

  lt.set_user = function(user_id){
    this.__set_cookie('_ltuid', user_id);
    this.ltuid = user_id;
    for(var x=0;x<this.accs.length; x++){
      this.__register_pv(this.accs[x]);
      this.__check_inputs(this.accs[x]);
    }
  };

  lt.__register_pv = function(accid){
    var x = 0, campaign_field;
    var params = '?acc='+accid;
    if(document.referrer)
      params += '&ref='+encodeURIComponent(document.referrer);

    if(document.URL)
      params += '&url='+encodeURIComponent(document.URL);

    params += '&ltuid='+this.ltuid;
    params += '&pvid='+this.pvid;
    for(x=0;x<this.__config__.campaign_fields.length; x++) {
      campaign_field = this.__config__.campaign_fields[x];
    if(lt.get_param('ltk_'+campaign_field))
      params += '&'+campaign_field+'='+lt.get_param('ltk_'+campaign_field)

    }
    params += '&v='+this._v;
    this.__include(this.__config__.server.pv + params);
    this.__include(this.__config__.server.tag+'cpl/ltcpl'+accid+'.js');
    this.__register_lz(accid);
  };

  lt.__register_event = function(event) {
    var r;
    if(typeof event === "object") r = event;
    else r = {'event': event};

    for(var x=0; x<this.accs.length;x++) {
      var params = '?acc='+this.accs[x];
      params += '&ltuid='+this.ltuid;
      params += '&v='+this._v;
      params += '&pvid='+this.pvid;
      params += '&event=' +  encodeURIComponent(JSON.stringify(r));
      this.__include(this.__config__.server.e + params);
    }
  };

  lt.__register_lz = function(accid){
    if(!lt._c.lzcode) return;
    var params = '?acc='+accid;
    params += '&pvid='+this.pvid;
    params += '&ltuid='+this.ltuid;
    params += '&lzid='+lt._c.lzcode[1];
    params += '&lzgrp='+lt._c.lzcode[0];
    params += '&v='+this._v;
    this.__include(this.__config__.server.lz + params);

  };

  lt.__do_input_sync = function(input_email, accid){
    var params = '?acc='+accid;
    params += '&mail='+encodeURIComponent(input_email.value);
    params += '&ltuid='+this.ltuid;
    params += '&pvid='+this.pvid;
    params += '&formid=-1';
    params += '&v='+this._v;
    this.__include(this.__config__.server.sync + params);
  };

  lt.__check_inputs = function(accid){
    var input_email;
     document.querySelectorAll("input[name*=email i],input[type*=email i]").forEach(function(input_email) {
      input_email.ltk_binded = input_email.ltk_binded || [];
      if(input_email.ltk_binded.indexOf(accid)>=0) return;
      input_email.ltk_binded.push(accid);
      if(input_email.value)
          lt.__do_input_sync(input_email, accid)
      input_email.addEventListener('change', function() {
          lt.__do_input_sync(input_email, accid)
      })
    })

    window.setTimeout(function(){
      window.lt.__check_inputs(accid);
    },200);
  };


  lt.__release_form = function(form_id){
    // TODO: remove it
    // ATENTION: back-end callback xD
    return;
  }

  lt.__get_TLD = function (){
    var tld, parts, parcial = "",
        x, date, result, val, coknm;
    coknm = 'ltTLD';
    date = new Date();
    val = date.getTime();
    tld = window.localStorage.getItem(coknm);
    if (tld) return tld;
    parts = window.location.hostname.split(".");
    for (x = parts.length - 1; x > 0; x--) {
        parcial = "." + parts[x] + parcial;
        date.setTime(date.getTime() + 5 * 1000);
        document.cookie = coknm + '=' + val + ';expires=' + (date.toGMTString()) + ';domain=' + parcial;
        result = this.__get_cookie(coknm);
        if (result == val) {
          window.localStorage.setItem(coknm, parcial);
          date = new Date();
          document.cookie = coknm + '=' + val + ';expires=' + (date.toGMTString()) + ';domain=' + parcial;
          return parcial;
        }
    }
    return '.' + window.location.hostname;
  };

  lt.__set_cookie = function(name, value, ttl){
    var d = new Date();
    if (ttl != ttl || !ttl) ttl = 365 * 24 * 60;
    d.setTime(d.getTime() + (ttl * 60 * 1000));
    var ttl = d.toGMTString();
    this.d.cookie = name + "=" + value + ";expires=" + ttl + ";path=/;domain=" + this.dom;
  };

  lt.__get_cookie = function(name) {
      var start = this.d.cookie.indexOf(name + "=");
      var len = start + name.length + 1;
      if ((!start) && (name != this.d.cookie.substring(0, name.length))) return "";
      if (start == -1) return "";
      var end = this.d.cookie.indexOf(";", len);
      if (end == -1) end = this.d.cookie.length;
      return unescape(this.d.cookie.substring(len, end));
  };

  lt.__include = function(src, callback) {
      var c = this.d.createElement("script");
      c.type = "text/javascript";
      c.src = src;
      if(callback) c.onload = callback;
      var p = this.d.getElementsByTagName('script')[0];
      p.parentNode.insertBefore(c, p);
  };

  lt.__get_params = function() {
    var params = {};
    var prmstr = window.location.search.substr(1);
    var prmarr = prmstr.split("&");
    for ( var i = 0; i < prmarr.length; i++) {
        var tmparr = prmarr[i].split("=");
        params[tmparr[0]] = tmparr[1];
    }
    return params;
  };

  lt.get_param = function(k) {
    return this.__url_params__[k];
  };

  lt.b62 = {
    charset: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
      .split(''),
    encode: integer => {
      if (integer === 0) {
        return 0;
      }
      let s = [];
      while (integer > 0) {
        s = [lt.b62.charset[integer % 62], ...s];
        integer = Math.floor(integer / 62);
      }
      return s.join('');
    },
    decode: function(chars){
      var q, r_chars = chars.split('').reverse();
      var r = 0;
      for(q=0; q < r_chars.length; q++) {
        r += (lt.b62.charset.indexOf(r_chars[q]) * (62**q));
      }
      return r;
    }
  };

  lt.__config_cpls = function(cpls) {
    var cpl, x =0;
    for(x=0; x<cpls.length; x++){
      cpl = cpls[x];
      if(window.location.href.indexOf(cpl[0]) >= 0){
        if(cpl[2] == 'youtube')
          window.lt.__bind_cpls_youtube(cpl[1])
        if(cpl[2] == 'vimeo')
          window.lt.__bind_cpls_vimeo(cpl[1])
      }
    }
  };

  lt.__send_cpl_watched = function(currentTime, video_id){
    window.lt.__cpls_status.cur_time = currentTime;
    for(var x=0;x<this.accs.length; x++){
      var params = '?acc='+this.accs[x];
      params += '&ltuid='+this.ltuid;
      params += '&pvid='+this.pvid;
      if(document.referrer)
        params += '&ref='+encodeURIComponent(document.referrer);
      params += '&wtime='+currentTime;
      params += '&vid='+video_id;
      this.__include(this.__config__.server.cpl + params);
    }

  };

  lt.__bind_cpls_youtube = function(video_id){

    function bind_iframe(iframe){
      if(iframe.src.indexOf('?'))
        iframe.src+='&enablejsapi=1'
      else
        iframe.src+='?enablejsapi=1'

      var player, iframe_id = iframe.id;
      if(!iframe_id)
        iframe_id = iframe.id = 'lt-yt-iframe';
      player = new YT.Player(iframe_id)
      window.setInterval(function(){
        if(window.lt.__cpls_status.cur_time != player.playerInfo.currentTime)
          window.lt.__send_cpl_watched(player.playerInfo.currentTime, video_id)

      }, 60000)
    }

    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    tag.onload = function(){
      document.querySelectorAll('iframe').forEach(function(iframe){
        if(iframe.src.indexOf(video_id) > 0)
          window.setTimeout(function(){
            bind_iframe(iframe)
          }, 1000);
      });
    }
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }

  lt.__bind_cpls_vimeo = function(video_id){

    function bind_iframe(iframe){

      var player;
      player = new Vimeo.Player(iframe)
      window.setInterval(function(){
        player.getCurrentTime().then(function(seconds) {
          if(!seconds) return;

          if(window.lt.__cpls_status.cur_time != seconds)
          window.lt.__send_cpl_watched(seconds, video_id)
      })

      }, 60000)
    }

    var tag = document.createElement('script');
    tag.src = "https://player.vimeo.com/api/player.js";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    tag.onload = function(){
      document.querySelectorAll('iframe').forEach(function(iframe){
        if(iframe.src.indexOf(video_id) > 0)
          window.setTimeout(function(){
            bind_iframe(iframe)
          }, 1000);
      });
    }
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }


  lt.__init__();
})();
