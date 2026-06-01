const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  Events
} = require('discord.js');

// 🔥 FIX: intents corrigidos (isso é o que faltava)
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// 🔧 CONFIGURAÇÕES
const CANAL_ENVIO = '1510807765319155902';
const CANAL_LOG = '1510823224022401175';

client.once('ready', () => {
  console.log(`✅ Bot online como ${client.user.tag}`);
});

// 🟢 FIX: comando !painel adicionado
client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  if (message.content === "!painel") {
    message.reply("📋 **Painel aberto!**");
  }
});


// 📌 COMANDO /carta
client.on(Events.InteractionCreate, async (interaction) => {

  // COMANDO
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'carta') {

      const menu = new StringSelectMenuBuilder()
        .setCustomId('tipo_carta')
        .setPlaceholder('Escolha o tipo de carta')
        .addOptions([
          {
            label: '👻 Anônima',
            value: 'anonimo'
          },
          {
            label: '✍️ Assinada',
            value: 'assinado'
          }
        ]);

      const row = new ActionRowBuilder().addComponents(menu);

      await interaction.reply({
        content: '📩 Escolha o tipo da carta:',
        components: [row],
        ephemeral: true
      });
    }
  }

  // SELECT MENU
  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === 'tipo_carta') {

      const tipo = interaction.values[0];

      const modal = new ModalBuilder()
        .setCustomId(`modal_${tipo}`)
        .setTitle('Enviar Carta');

      const userInput = new TextInputBuilder()
        .setCustomId('destinatario')
        .setLabel('ID do destinatário')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const msgInput = new TextInputBuilder()
        .setCustomId('mensagem')
        .setLabel('Sua mensagem')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(userInput),
        new ActionRowBuilder().addComponents(msgInput)
      );

      await interaction.showModal(modal);
    }
  }

  // MODAL
  if (interaction.isModalSubmit()) {

    const tipo = interaction.customId.split('_')[1];

    const userId = interaction.fields.getTextInputValue('destinatario');
    const msg = interaction.fields.getTextInputValue('mensagem');

    let user;

    try {
      user = await client.users.fetch(userId);
    } catch {
      return interaction.reply({
        content: '❌ Usuário inválido!',
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setColor('#ED4245')
      .setTitle('💌 𝑪𝑨𝑹𝑻𝑨 𝑹𝑬𝑪𝑬𝑩𝑰𝑫𝑨')
      .setDescription(`
╔══════════════════╗  
   ✉️ **NOVA MENSAGEM**  
╚══════════════════╝  

> 💬 ${msg}

━━━━━━━━━━━━━━━━━━━
`)
      .addFields(
        {
          name: '🎯 Destinatário',
          value: `<@${user.id}>`,
          inline: true
        },
        {
          name: '📨 Tipo',
          value: tipo === 'anonimo' ? '👻 Anônima' : '✍️ Assinada',
          inline: true
        }
      )
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setImage('https://media.tenor.com/8rQeZ8YQ6xUAAAAC/red-aesthetic.gif')
      .setFooter({
        text: tipo === 'anonimo'
          ? '👻 Remetente oculto'
          : `✍️ Enviado por ${interaction.user.username}`
      })
      .setTimestamp();

    const canal = await client.channels.fetch(CANAL_ENVIO);
    await canal.send({ embeds: [embed] });

    const log = new EmbedBuilder()
      .setColor('#2B2D31')
      .setTitle('📜 Log de Carta')
      .addFields(
        { name: 'Remetente', value: `${interaction.user.tag}`, inline: true },
        { name: 'Destino', value: `${user.tag}`, inline: true },
        { name: 'Tipo', value: tipo, inline: true },
        { name: 'Mensagem', value: msg }
      )
      .setTimestamp();

    const canalLog = await client.channels.fetch(CANAL_LOG);
    await canalLog.send({ embeds: [log] });

    await interaction.reply({
      content: '✅ Carta enviada com sucesso!',
      ephemeral: true
    });
  }
});

client.login(process.env.TOKEN);
