export default {
  name: 'config',
  alias: ['c'],
  description: 'Configure Weex Toolkit settings',
  hidden: false,
  run: async toolbox => {
    const {
      parameters,
      fs,
      system,
      logger
    } = toolbox;
    let cache;
    const configurationFilename = 'config.json';
    const homePrefix = '.wx';
    const first = parameters.first;
    const second = parameters.second;
    let third = parameters.third;
    const options = parameters.options;
    const showHelp = async (subcommand?: string) => {
      let usageTableData = [
        [logger.colors.success('Synopsis'), logger.colors.success('Usage')],
        ['$ weex config', 'Configure Weex Toolkit settings']
      ]
      let des = {
        set: ['config set <key> <value>', 'set key-value'],
        get: ['config get <key>', 'get value by key'],
        list: ['config list [--json]', 'list key-value as string or json'],
        delete: ['config delete <key>', 'delete key-value by key']
      }
      let relatedCommandData = [
        [logger.colors.success('Command'), logger.colors.success('Description')],
        des.set,
        des.get,
        des.list,
        des.delete
      ]
      if (subcommand && des[subcommand]) {
        logger.info('\nYou need to using like this:\n');
        let relatedCommandData = [
          [logger.colors.success('Command'), logger.colors.success('Description')],
          des[subcommand]
        ]
        logger.table(relatedCommandData, {format: 'markdown'})
      }
      else {
        logger.success('\n# weex config\n')
        logger.table(usageTableData, {format: 'markdown'})
        logger.info('\nRun the config script to try to configure global weex settings')
        logger.success('\n# Related Commands\n')
        logger.table(relatedCommandData, {format: 'markdown'})
        logger.info(`\nThis script has alias(c), you can run it like \`weex c [sub-command]\``)
      }
    }

    if (first !== 'set' && first !== 'get' && first !== 'delete' && first !== 'list') {
      await showHelp();
      return ;
    }
    else if (options.help) {
      await showHelp();
      return ;
    }
    const configurationPath = system.userhome(homePrefix, configurationFilename);
    const get = async (key?: string) => {
      if (cache) {
        return cache;
      }
      else {
        cache = fs.read(configurationPath, 'json');
      }
      if (key) {
        return cache[key];
      }
      return  cache;
    };
    const set = async (key: string, value: string | boolean) => {
      if (!cache) {
        cache = await get();
      }
      cache[key] = value;
      return cache;
    }
    const remove = async (key:string) => {
      if (!cache) {
        cache = await get();
      }
      const temp = cache[key];
      if (cache[key]) {
        delete cache[key]
      }
      return temp;
    }
    const list = async (format?: string) => {
      const data = await get();
      let text = [];
      if (format === 'json') {
        return JSON.stringify(data);
      }
      else {
        for (let key in data) {
          if (typeof data[key] === 'boolean') {
            text.push(`${key} = ${data[key]}`)
          }
          else {
            text.push(`${key} = "${data[key]}"`)
          }
        }
        return text.join('\n');
      }
    }
    const save = async (data?: any) => {
      fs.write(configurationPath, data || cache);
    }
    switch(first) {
      case 'get': 
        if (second) {
          let value = await get(second);
          if (typeof value === 'boolean') {
            logger.info(`- ${second} = ${value}`)
          }
          else {
            logger.info(`- ${second} = "${value}"`)
          }
        }
        else {
          await showHelp(first)
        }
        break;
      case 'set':
        if (second && third) {
          if (third === "true") {
            third = true
          }
          else if (third === 'false') {
            third = false
          }
          let data = await set(second, third);
          logger.success(`\nset success\n`)
          if (data[second] === third) {
            if (typeof third === 'boolean'){
              logger.info(`- ${second} = ${third}`)
            }
            else {
              logger.info(`- ${second} = "${third}"`)
            }
          }
          await save();
        }
        else {
          await showHelp(first)
        }
        break;
      case 'list':
        let listdata;
        if (options.json) {
          listdata = await list('json')
        }
        else {
          listdata = await list()
        }
        logger.success(`\nconfigurations:\n`)
        logger.info(listdata);
        break;
      case 'delete':
        if (second) {
          let value = await remove(second);
          logger.success(`\ndelete success\n`)
          if (typeof value === 'boolean') {
            logger.info(`- ${second} = ${value}`)
          }
          else {
            logger.info(`- ${second} = "${value}"`)
          }
          await save();
        }
        else {
          await showHelp(first)
        }
        break;
      default:
        await showHelp()
        break;
    }
  }
}
