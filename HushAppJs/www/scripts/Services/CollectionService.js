/// Compares two collections based on a string key and returns object with added/removed elements
var CollectionService = function () {

    this.module = this;

    function reconcile(col1, col2, basedOn) {
        var col1Identities = _.pluck(col1, basedOn);
        var col2Identities = _.pluck(col2, basedOn);

        var removed = _.difference(col1Identities, col2Identities);
        var added = _.without.apply(_, [col2Identities].concat(col1Identities).concat(removed));

        var removedCol = _.filter(col1, (element) => _.contains(removed, element[basedOn]));
        var addedCol = _.filter(col2, (element) => _.contains(added, element[basedOn]));

        return { added: addedCol, removed: removedCol };
    }

    this.module.recon = function (col1, col2, basedOn) { return reconcile(col1, col2, basedOn) };

    return this.module;
};