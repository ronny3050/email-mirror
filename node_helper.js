/**
 * Created by debayan on 7/23/16.
 */
var notifier = require('./notifier');
var NodeHelper = require('node_helper');
var _ = require('underscore');

module.exports = NodeHelper.create({
        start: function(){
            console.log(this.name + ' helper started ...');
        },
        socketNotificationReceived : function(notification, payload){
            if(notification === 'LISTEN_EMAIL'){
                console.log('listening for emails...');
                this.config = payload.config;
                this.payload = payload.payload;
                this.loaded = payload.loaded;
                final = [];
                imap = {
                    user: this.config.user,
                    password: this.config.password,
                    host: this.config.host,
                    port: this.config.port,
                    tls: this.config.tls,
                    tlsOptions: this.config.tlsOptions,
                    markSeen: false,
                    authTimeout: this.config.authTimeout
                };
                var that = this;

                var seqs = [];
                if(this.payload.length > 0)
                    this.payload.forEach(function(o){
                        seqs.push(o.id);
                    });

                var n = notifier(imap);
                n.on('end', function () { // session closed
                    final = _.sortBy(final,'id').reverse();
                    final = _.uniq(final, true, 'id');

                    that.sendSocketNotification('EMAIL_RESPONSE', final);
                    n.stop();
                }).on('mail', function (m,s) {
                    if(seqs.indexOf(s) == -1) {
                        console.log('NEW MAIL');
                        var a = [{
                            address: m.from[0].address,
                            name: m.from[0].name
                        }];
                        var b = m.subject;
                        var tmp = {
                            sender: a,
                            subject: b,
                            id: s
                        };
                        final.push(tmp);
                        n.stop();
                    }
                }).on('error', function(e){
                    console.log('Email notifier error: ', e);
                    n.start();
                }).on('nonew',function(){
                    if(!that.loaded)
                    {
                        n.stop();
                    }
                }).start();
            }
        }
});

