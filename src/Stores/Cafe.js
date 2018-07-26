import { Client } from "../Client.js";

import { initLanguageCodeObject, defaultLanguage, languageCodes } from '../Utilities/LanguageCodes'

let changeListeners = [];
const resetStore = () => {
    let languageInitialized = {};
    languageCodes.forEach((language) => {
        languageInitialized[language] = false;
    });

    return {
        cafes: initLanguageCodeObject(),
        languageInitialized: languageInitialized
    }
};
let { cafes, languageInitialized } = resetStore();


let notifyChange = (newlanguage) => {
    changeListeners.forEach((listener) => {
        listener(newlanguage);
    });
}

let fetchCafes = (language) => {
    if (languageInitialized[language]) {
        notifyChange(language);
        return;
    }

    let query = Client.items()
        .type('cafe')
        .orderParameter('system.name')
    if (language) {
        query.languageParameter(language);
    }

    query.getObservable()
        .subscribe(response => {
            if (language) {
                cafes[language] = response.items;
            } else {
                cafes[defaultLanguage] = response.items;
            }
            notifyChange(language);
            languageInitialized[language] = true;
        });
}

class Cafe {

    // Actions

    providePartnerCafes(language) {
        fetchCafes(language);
    }

    provideCompanyCafes(language) {
        fetchCafes(language);
    }

    // Methods

    getPartnerCafes(language) {
        return cafes[language].filter((cafe) => cafe.country.value !== "USA");
    }

    getCompanyCafes(language) {
        return cafes[language].filter((cafe) => cafe.country.value === "USA");
    }

    // Listeners

    addChangeListener(listener) {
        changeListeners.push(listener);
    }

    removeChangeListener(listener) {
        changeListeners = changeListeners.filter((element) => {
            return element !== listener;
        });
    }

}

let CafeStore = new Cafe();

export {
  CafeStore,
  resetStore
};