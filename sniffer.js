const AONetwork = require("ao-network");
const { EventEmitter } = require("events");
const {log} = require("electron-log");

class AlbionBlackMarketSniffer extends EventEmitter {
    aoNet;

    constructor() {
        super();
        this.aoNet = new AONetwork();
        this._init();
    }

    _init() {
        /**
         * Auction
         */
        this.aoNet.events.on(this.aoNet.AODecoder.messageType.OperationResponse, async  (context) => {
            try {
                if (!context.parameters.hasOwnProperty('253') ||
                    context.parameters['253'] !== this.aoNet.data.operations.AUCTION_MODIFY_AUCTION) {
                    return;
                }

                if (!context.parameters.hasOwnProperty('0')) {
                    return;
                }

                const offers = [];

                for (let encodedOffer of (context.parameters['0'] || [])) {
                    const offer = JSON.parse(encodedOffer);

                    offers.push({
                        ...offer,
                        TotalPriceSilver: offer.TotalPriceSilver / 10000,
                        UnitPriceSilver: offer.UnitPriceSilver / 10000
                    });
                }

                this.emit('auction_update', offers);
            } catch (e) {
                log.error(e);
            }
        });
    }
}

module.exports = AlbionBlackMarketSniffer;