const router = require('express-promise-router')();
const OwnerMController = require('../controllers/ownerM');
const { validateParam, validateBody, schemas } = require('../helpers/routeHelpers');

router.route('/')
  .get(OwnerMController.index)
  .post(validateBody(schemas.ownerMSchema), OwnerMController.newOwnerM);

router.route('/:ownermid') // /ownersM/xyz
  .get(validateParam(schemas.mIdSchema, 'ownermid'), OwnerMController.getOwnerM)
  .put([validateParam(schemas.mIdSchema, 'ownermid'),
    validateBody(schemas.ownerMSchema)],
    OwnerMController.replaceOwnerM)
  .patch([validateParam(schemas.mIdSchema, 'ownermid'),
    validateBody(schemas.ownerMOptionalSchema)],
    OwnerMController.updateOwnerM)
  .delete(validateParam(schemas.mIdSchema, 'ownermid'),
    OwnerMController.deleteOwnerM);

module.exports = router;
