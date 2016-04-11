// selectHouse Template

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

Template.selectHouse.events = {
  'change #selectHouse': function (evt) {
    //console.log(HousesCollection.findOne({_id: evt.currentTarget.value}))
    Session.set('selectedHouseId', evt.currentTarget.value)
  }
}


Template.showHouse.helpers({
  house: () => {
    return HousesCollection.findOne({_id: Session.get('selectedHouseId')})
  }
})
