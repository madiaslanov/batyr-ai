import {combineReducers} from "@reduxjs/toolkit";

let rootReducer = combineReducers({

})

export type RootReducer = ReturnType<typeof rootReducer>;

export default rootReducer;