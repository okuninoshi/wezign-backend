const { parseMultipartData, sanitizeEntity } = require('strapi-utils');

module.exports = {
  /**
   * Create a record.
   *
   * @return {Object}
   */

  async create(ctx) {
    let entity;
    if (ctx.is('multipart')) {
      const { data, files } = parseMultipartData(ctx);
      data.author = ctx.state.user.id;
      entity = await strapi.services.product.create(data, { files });
    } else {
      ctx.request.body.author = ctx.state.user.id;
      entity = await strapi.services.product.create(ctx.request.body);
    }
    return sanitizeEntity(entity, { model: strapi.models.product });
  },
  async update(ctx) {
    const { id } = ctx.params;
    let entity;
    const [product] = await strapi.services.product.find({
      id: ctx.params.id,
      'author.id': ctx.state.user.id,
    });
    if (!product) {
      return ctx.unauthorized(`You can't update this entry`);
    }
    if (ctx.is('multipart')) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services.product.update({ id }, data, {
        files,
      });
    } else {
      entity = await strapi.services.product.update({ id }, ctx.request.body);
    }
    return sanitizeEntity(entity, { model: strapi.models.product });
  },
  async find(ctx) {
    let entities;
    const {user} = ctx.state
    // console.log("from ctx user",user)
    if (ctx.query._q) {
      entities = await strapi.services.product.search(ctx.query);
    } else {
      entities = await strapi.services.product.find(ctx.query);
    }

    return entities.map(entity => {
      const product = sanitizeEntity(entity, {
        model: strapi.models.product,
      });
      // console.log("from product author id",product.author.id)
      if(product.author.id == user.id){
        return product
      }
      return "you don't have any product"
    });
  },
};