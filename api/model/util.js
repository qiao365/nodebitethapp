"use strict";


let util = module.exports;


util.guid = function guid(){
    /** it just version 4 guid **/
    function s4(){
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    };
    return [s4(), s4(), '-', s4(), '-', s4(), '-', s4(), s4(), s4()].join();
};
