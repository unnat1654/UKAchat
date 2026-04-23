class PeerService{
    constructor(){
        this.reset();
    }
    reset(){
        if(this.peer){
            try{
                this.peer.close();
            }catch(e){}
        }
        this.peer=new RTCPeerConnection({
            iceServers: [
                {
                    urls:[
                        "stun:stun.l.google.com:19302",
                        "stun:global.stun.twilio.com:3478"
                    ]
                }
            ]
        });
    }
    async getAnswer(offer){
        if(this.peer){
            await this.peer.setRemoteDescription(offer);
            const ans=await this.peer.createAnswer();
            await this.peer.setLocalDescription(new RTCSessionDescription(ans));
            return ans;
        }
    }
    async setLocalDescription(ans){
        if(this.peer){
            await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
        }
    }
    async getOffer(){
        if(this.peer){
            const offer= await this.peer.createOffer();
            await this.peer.setLocalDescription(new RTCSessionDescription(offer));
            return offer;
        }
    }
}

export default new PeerService();
