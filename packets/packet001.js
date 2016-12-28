//packet001
//Host Connection packet

module.exports = function(me){
    var _p = {};
    _p.serve = function(data){
        var sessionID = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 4); //creates a random 4 character session id
        var createSession = true;
        for(var i in global.sessions){
            //looking for if the host is already a host (redundent check for good measure)
            if(global.sessions[i].host.ip===me.ip){
                createSession = false; //don't create another session for this host
                break;
            }else if(global.sessions[i].id===sessionID){
                //handles the EXTREMELY rare case that a duplicate session ID was generated
                sessionID = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 4); //regenerates a new session ID
                i=-1;continue; // starts the loop over to make sure ensure no duplicates
            }
        }
        //addes the session to the global session array
        if(createSession){
            console.log(me.ip + " connected as Host for Session "+ sessionID);
            global.sessions.push({
                host:me,
                id:sessionID,
                clients:[]
            });
        }else{
            console.log("Host "+me.ip+" already connected to another session");
        }
        console.log(global.sessions);
    }
    _p.respond = function(){

    }
    return _p;
};
