const pdfJs = await import("../pdfjs-5.2.133-dist/build/pdf.mjs");

pdfJs.GlobalWorkerOptions.workerSrc = "./pdf.worker.mjs";

Hooks.on("renderCharacterSheetPF2e", async function (obj, html) {
    const actor = obj.actor;
    if (!(actor.type === "character")) {
        return;
    }
    if (actor.canUserModify(game.user, "update") == false) {
        return;
    }

    let element = html.find(".window-header .window-title");
    if (element.length != 1) return;
    let button = $(
      `<a class="popout" style><i class="fas fa-book"></i>Import from Demiplane</a>`
    );
    button.on("click", () => importer(obj.object));
    element.after(button);
});

async function importer(targetActor) {
    console.log("Got this actor:");
    console.log(targetActor);
    new foundry.applications.api.DialogV2({
        window: { title: "Choose a Demiplane PDF" },
        content: await renderTemplate("modules/demiplane-pf2e-foundry-importer/templates/importDiag.html") ,
        buttons: [{
            action: "import",
            label: "Import Character",
            default: true,
            callback: async html => {
                if (html instanceof HTMLElement) return;
                const form = html.target.form[0];
                if (!form.files.length) return ui.notifications.error("You did not upload a data file!");
                
                const file = form.files[0];
                if (file) {
                    file.arrayBuffer().then(buff => {
                        let x = new Uint8Array(buff);
                        startImport(x, targetActor);
                    });
                }
            }
        },
        {
            action: "cancel",
            label: "Cancel"
        }]
    }).render({ force: true });
}

async function startImport(srcFile, targetActor) {
    const pdf = await pdfJs.getDocument(srcFile).promise;

    const fieldObjects = await pdf.getFieldObjects();
    console.log("Parsed this PDF:");
    console.log(fieldObjects);

    importCharacter(fieldObjects, targetActor);
}

async function importCharacter(pdfFields, targetActor) {
    let character = {};

    await targetActor.update({
        name: pdfFields.character_name[0].value,

        // FIXME is not read yet
        "system.abilities.str.base": pdfFields.strength[0].value,
        "system.abilities.dex.base": pdfFields.dexterity[0].value,
        "system.abilities.con.base": pdfFields.constitution[0].value,
        "system.abilities.int.base": pdfFields.intelligence[0].value,
        "system.abilities.wis.base": pdfFields.wisdom[0].value,
        "system.abilities.cha.base": pdfFields.charisma[0].value,

        "system.attributes.ac.modifiers": [
            {
                "modifier": pdfFields.ac_dex_bonus[0].value
            },
            {
                "modifier": pdfFields.ac_prof_bonus[0].value
            }
        ],
        "system.attributes.hp.value": pdfFields.current_hp[0].value,
        "system.attributes.hp.max": pdfFields.hp_max[0].value,
        "system.attributes.hp.temp": pdfFields.temporary_hp[0].value,
        "system.attributes.speed.value": pdfFields.speed[0].value,
        "system.attributes.speed.otherSpeeds": [
            //fill it up outside
        ],

        // needs to be calculated outside
        //"system.attributes.resources.heropoints.value": heropoints,

        "system.details.languages.value": [
            pdfFields.languages[0].value
        ], //string array
        "system.details.level.value": pdfFields.level[0].value,
        // "system.details.keyability.value": pdfFields.keyability, no idea
        "system.details.ancestry.name": pdfFields.ancestry[0].value, //might need more or other input
        "system.details.class.name": pdfFields.class[0].value, //might need more or other input
        "system.details.class.trait": pdfFields.class[0].value, //might need more or other input

        "system.details.xp.value": pdfFields.xp[0].value,
        "system.details.age.value": pdfFields.age[0].value,
        "system.details.height.value": pdfFields.height[0].value,
        "system.details.weight.value": pdfFields.weight[0].value,
        "system.details.gender.value": pdfFields.gender_pronouns[0].value,
        "system.details.ethnicity.value": pdfFields.ethnicity[0].value,
        "system.details.nationality.value": pdfFields.nationality[0].value,

        // "system.details.biography.appearance": pdfFields.level[0].value, has two entries
        // "system.details.biography.backstory": pdfFields.level[0].value,
        // "system.details.biography.birthplace": pdfFields.level[0].value,
        // "system.details.biography.attitude": pdfFields.level[0].value,
        // "system.details.biography.beliefs": pdfFields.level[0].value,
        // "system.details.biography.anathema": pdfFields.level[0].value,
        // "system.details.biography.edicts": pdfFields.level[0].value,
        // "system.details.biography.likes": pdfFields.level[0].value,
        // "system.details.biography.dislikes": pdfFields.level[0].value,
        // "system.details.biography.catchphrases": pdfFields.level[0].value,
        // "system.details.biography.campaignNotes": pdfFields.level[0].value,
        // "system.details.biography.allies": pdfFields.level[0].value,
        // "system.details.biography.enemies": pdfFields.level[0].value,
        // "system.details.biography.organizations": pdfFields.level[0].value,
        // "system.details.biography.deities": pdfFields.level[0].value,

        "system.traits.size.value": pdfFields.size[0].value,

        // "system.traits.languages.value": pdfFields.languages,
        // "system.traits.senses": senses,
        
        // "system.saves.fortitude.rank": pdfFields.proficiencies.fortitude / 2,
        // "system.saves.reflex.rank": pdfFields.proficiencies.reflex / 2,
        // "system.saves.will.rank": pdfFields.proficiencies.will / 2,

        // "system.martial.advanced.rank": pdfFields.proficiencies.advanced / 2,
        // "system.martial.heavy.rank": pdfFields.proficiencies.heavy / 2,
        // "system.martial.light.rank": pdfFields.proficiencies.light / 2,
        // "system.martial.medium.rank": pdfFields.proficiencies.medium / 2,
        // "system.martial.unarmored.rank": pdfFields.proficiencies.unarmored / 2,
        // "system.martial.martial.rank": pdfFields.proficiencies.martial / 2,
        // "system.martial.simple.rank": pdfFields.proficiencies.simple / 2,
        // "system.martial.unarmed.rank": pdfFields.proficiencies.unarmed / 2,
        // "system.skills.acr.rank": pdfFields.proficiencies.acrobatics / 2,
        // "system.skills.arc.rank": pdfFields.proficiencies.arcana / 2,
        // "system.skills.ath.rank": pdfFields.proficiencies.athletics / 2,
        // "system.skills.cra.rank": pdfFields.proficiencies.crafting / 2,
        // "system.skills.dec.rank": pdfFields.proficiencies.deception / 2,
        // "system.skills.dip.rank": pdfFields.proficiencies.diplomacy / 2,
        // "system.skills.itm.rank": pdfFields.proficiencies.intimidation / 2,
        // "system.skills.med.rank": pdfFields.proficiencies.medicine / 2,
        // "system.skills.nat.rank": pdfFields.proficiencies.nature / 2,
        // "system.skills.occ.rank": pdfFields.proficiencies.occultism / 2,
        // "system.skills.prf.rank": pdfFields.proficiencies.performance / 2,
        // "system.skills.rel.rank": pdfFields.proficiencies.religion / 2,
        // "system.skills.soc.rank": pdfFields.proficiencies.society / 2,
        // "system.skills.ste.rank": pdfFields.proficiencies.stealth / 2,
        // "system.skills.sur.rank": pdfFields.proficiencies.survival / 2,
        // "system.skills.thi.rank": pdfFields.proficiencies.thievery / 2,
    });
}