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

Template.registerHelper('withIndex', function (list) {
  var withIndex = _.map(list, function (v, i) {
    if (v === null) return
    v.index = i
    return v
  })
  return withIndex
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
  'click button#save-house': function (evt) {
    evt.preventDefault();
    var id = Session.get('selectedHouseId');
    var modifier = {$set: {'lastsave': new Date()}};
    updateLocalHouse(id, modifier);
    // persist house document in remote db
    HousesCollection.upsert(
      {_id: id},
      LocalHouse.findOne(id)
    );
  },
  'keyup input#house-name': function (evt) {
    evt.preventDefault()
    var modifier = {$set: {'name': evt.currentTarget.value}}
    updateLocalHouse(Session.get('selectedHouseId'), modifier)
  },
  'click button.addPlant': function(evt) {
    evt.preventDefault()
    var newPlant = {color: '', instructions: ''}
    var modifier = {$push: {'plants': newPlant}}
    updateLocalHouse(Session.get('selectedHouseId'), modifier)
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

Template.plantFieldset.events({
  'keyup input.color, keyup input.instructions': function (evt) {
    evt.preventDefault();
    var index = evt.target.getAttribute('data-index');
    var field = evt.target.getAttribute('class');
    var plantProperty = 'plants.' + index + '.' + field;
    var modifier = {$set: {}};
    modifier['$set'][plantProperty] = evt.target.value;
    updateLocalHouse(Session.get('selectedHouseId'), modifier);
  },
  'click button.removePlant': function (evt) {
    evt.preventDefault();
    var index = evt.target.getAttribute('data-index');
    var plants = Template.parentData(1).plants;
    plants.splice(index, 1);
    var modifier = {$set: {'plants': plants}};
    updateLocalHouse(Session.get('selectedHouseId'), modifier);
  },
})


updateLocalHouse = function (id, modifier) {
  LocalHouse.update(
    {
      '_id': id
    },
    modifier
  );
};
