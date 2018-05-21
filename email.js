/**
 * Created by debayan on 7/24/16.
 */

Module.register("email",{

    // defaults : [
    //         {
    //             user: 'a@b.com',
    //             password: 'xxx',
    //             host: 'jjj.kkk.com',
    //             port: 993,
    //             tls: true,
    //             authTimeout: 10000,
    //             numberOfEmails: 5,
    //             fade: true,
    //             maxCharacters: 30
    //         }
    //     ]
    payload: [],

    start : function(){
        console.log("Email module started!");
        console.log('MEMEME', this.config);
        this.sendSocketNotification('LISTEN_EMAIL',{config: this.config, payload: this.payload, loaded: this.loaded});
        this.loaded = false;
    },

    socketNotificationReceived: function(notification, payload){
        if (notification === 'EMAIL_RESPONSE'){
            if(payload){
                this.loaded = true;
                var that = this;
                console.log("NEW PAYLOAD: ", payload);
                var payloadIds = that.payload.map(function(m) {return m.id});
                payload.forEach(function(m){
                    if(payloadIds.indexOf(m.id) == -1)
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
            if (typeof that.config.accounts !== "undefined") {
                var indexToRemove = [];
                for (var i = 0; i < this.config.accounts.length; i++) {
                    var maxNumEmails = this.config.accounts[i].numberOfEmails;
                    var count = 0;
                    for (var j = 0; j < this.payload.length; j++) {
                        if (this.payload[j].host === this.config.accounts[i].user) {
                            count++;
                        }
                        if (count > maxNumEmails) {
                            indexToRemove.push(j);
                        }
                    }
                }
                for (var j = 0; j < this.payload.length; j++) {
                    if (indexToRemove.indexOf(j) > -1) {
                        delete this.payload[j];
                    }
                }

                this.payload.forEach(function (mailObj) {

                    var host = mailObj.host.slice(0,1) + '@' + mailObj.host.substr(mailObj.host.indexOf('@') + 1)[0];

                    var name = mailObj.sender[0].name.replace(/['"]+/g, "");
                    name = name.substring(0, that.config.maxCharacters);

                    var subject = mailObj.subject.replace(/[\['"\]]+/g, "");
                    subject = subject.substring(0, that.config.maxCharacters);

                    var emailWrapper = document.createElement("tr");
                    emailWrapper.className = "normal";

                    var senderWrapper = document.createElement("tr");
                    senderWrapper.className = "normal";

                    var nameWrapper = document.createElement("td");
                    nameWrapper.className = "bright";
                    nameWrapper.setAttribute("data-letters", host);
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


                    // Calculate total possible emails
                    var totalEmails = 0;
                    for (var i = 0; i < that.config.accounts.length; i++) {
                        totalEmails += that.config.accounts[i].numberOfEmails;
                    }

                    // Create fade effect.
                    if (that.config.fade) {
                        var startingPoint = that.payload.slice(0, totalEmails).length * 0.25;
                        var steps = that.payload.slice(0, that.config.numberOfEmails).length - startingPoint;
                        if (count >= startingPoint) {
                            var currentStep = count - startingPoint;
                            emailWrapper.style.opacity = 1 - (1 / steps * currentStep);
                        }
                    }
                });

            }

        }
        else{
            wrapper.innerHTML = (this.loaded) ? "No new mails" : this.translate("LOADING");
            wrapper.className = "small dimmed";
            return wrapper;
        }

        return wrapper;
    }

});
