// selectHouse Template
LocalHouse = new Mongo.Collection(null)
var newHouse = {
  name: '',
  plants: [],
  lastsave: 'never',
  status: 'unsaved'
}
Session.setDefault('selectedHouseId', '')

Tracker.autorun(() => {
  console.log("The selectedHouse ID is :"
     + Session.get('selectedHouseId'));
})

Template.selectHouse.helpers({
  housesNameId: function () {
    return HousesCollection.find({}, {fields: {name: 1, _id: 1}})
  },
  isSelected: function () {
    return Session.equals('selectedHouseId', this._id) ? 'selected' : ''
  }
})

Template.selectHouse.events({
  'change #selectHouse': function (evt) {
    var selectedId = evt.currentTarget.value;
    var newId = LocalHouse.upsert(
      selectedId,
      HousesCollection.findOne(selectedId) || newHouse
    ).insertedId;
    if (!newId) newId = selectedId;
    Session.set('selectedHouseId', newId);
  }
});

Template.registerHelper('selectedHouse', function () {
  return LocalHouse.findOne(Session.get('selectedHouseId'));
});


Template.showHouse.helpers({
  house: () => {
    return HousesCollection.findOne({_id: Session.get('selectedHouseId')})
  }
})

// Template.plantDetails.onCreated(function() {
//   this.watered = new ReactiveVar()
//   this.watered.set(false)
// })
//
// Template.plantDetails.events({
//   'click button': function (evt, tpl) {
//     tpl.watered.set(true)
//   }
// })
//
// Template.plantDetails.helpers({
//   watered: function () {
//     return Template.instance().watered.get() ? 'disabled' : ''
//   }
// })

Template.plantDetails.events({
  'click button.water': function (evt) {
    //console.log("button clicked")
    var plantId = $(evt.currentTarget).attr('data-id')
    //console.log("plantId on Set: " + plantId);
    Session.set(plantId, true)
    var lastVisit = new Date()
    HousesCollection.update({
      _id: Session.get("selectedHouseId")
    }, {
      $set : {
        lastVisit: lastVisit
      }
    }
    )
  }
})



Template.plantDetails.helpers({
  isWatered: function () {
    var plantId = Session.get("selectedHouseId") + '-' + this.color

    //console.log("plantId: " + plantId);
    //console.log("session: " + Session.get(plantId))

    return Session.get(plantId) ? 'disabled' : 'x'
  }
})

Template.houseForm.events({
  'click button#saveHouse': function(evt) {
    evt.preventDefault()

    var houseName = $("input#house-name").val()
    var plantColor = $("input#plant-color").val()
    var plantInstructions = $("input#plant-instructions").val()

    Session.set('selectedHouseId', HousesCollection.insert({
      name: houseName,
      plants: [{
        color: plantColor,
        instructions: plantInstructions
      }]
    }))

    $('input').val('')
  }
})

Template.deleteHouse.events({
  'click button#deleteHouse': function(evt) {
    evt.preventDefault()

    const deleteConfirmation = confirm('Do you really want to delete this house?')

    if (deleteConfirmation) {
      HousesCollection.remove({_id: Session.get('selectedHouseId')})
      Session.set('selectedHouseId', undefined)
    }
  }
})
