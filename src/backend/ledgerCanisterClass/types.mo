



module {

    public type InitLedger = {


    };

    public type Kind = {
        #Business;
        #Collaboration;
        

    };

    public type Transaction = {
        date: Int;
        participants: [Principal];
        kind: Kind;

    }

}