/**
 * Created by debayan on 7/24/16.
 */

Module.register("email",{

    defaults : {
        user: 'a@b.com',
        password: 'xxx',
        host: 'jjj.kkk.com',
        port: 993,
        tls: true,
        authTimeout: 10000,
        numberOfEmails: 5,
        fade: true
    },
    payload: [],

    start : function(){
        console.log("Email module started!");
        this.sendSocketNotification('LISTEN_EMAIL',{config: this.config, payload: this.payload, loaded: this.loaded});
        this.loaded = false;
    },

    socketNotificationReceived: function(notification, payload){
        if (notification === 'EMAIL_RESPONSE'){
            if(payload){
                this.loaded = true;
                var that = this;
                console.log("NEW PAYLOAD: ", payload);
                payload.forEach(function(m){
                    if(that.payload.indexOf(m.id) == -1)
                        that.payload.push(m);
                });

                this.payload.sort(function(a,b) {return b.id - a.id; });

                this.sendSocketNotification('LISTEN_EMAIL',{config: this.config, payload: this.payload, loaded: this.loaded});
                this.updateDom(2000);
            }
        }
    },

    // Define required scripts.
    getStyles: function() {
        return ["email.css", "font-awesome.css"];
    },

    getDom: function(){
        var wrapper = document.createElement("table");
        wrapper.className = "small";
        var that =this;
        if(this.payload.length > 0)
        {
            var count = 0;
            this.payload.slice(0,this.config.numberOfEmails).forEach(function (mailObj) {

                var name = mailObj.sender[0].name.replace(/['"]+/g,"");
                var subject = mailObj.subject.replace(/[\['"\]]+/g,"");

                var emailWrapper = document.createElement("tr");
                emailWrapper.className = "normal";

                var senderWrapper = document.createElement("tr");
                senderWrapper.className = "normal";

                var nameWrapper = document.createElement("td");
                nameWrapper.className = "bright";
                nameWrapper.innerHTML = name;
                senderWrapper.appendChild(nameWrapper);
                var addressWrapper = document.createElement("td");
                addressWrapper.className = "address xsmall thin dimmed";
                addressWrapper.innerHTML = mailObj.sender[0].address;
                senderWrapper.appendChild(addressWrapper);
                emailWrapper.appendChild(senderWrapper);

                var subjectWrapper = document.createElement("tr");
                subjectWrapper.className = "light";
                subjectWrapper.innerHTML = subject;
                emailWrapper.appendChild(subjectWrapper);

                wrapper.appendChild(emailWrapper);

                // Create fade effect.
                if (that.config.fade) {
                    var startingPoint = that.payload.slice(0,that.config.numberOfEmails).length * 0.25;
                    var steps = that.payload.slice(0,that.config.numberOfEmails).length - startingPoint;
                    if (count >= startingPoint) {
                        var currentStep = count - startingPoint;
                        emailWrapper.style.opacity = 1 - (1 / steps * currentStep);
                    }
                }
                count++;
            });
        }
        else{
            wrapper.innerHTML = (this.loaded) ? "No new mails" : this.translate("LOADING");
            wrapper.className = "small dimmed";
            return wrapper;
        }

        return wrapper;
    }

});
