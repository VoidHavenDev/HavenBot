const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  Events,
  UserSelectMenuBuilder
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const CANAL_CARTAS = '1510807765319155902';
const CANAL_LOG = '1510823224022401175';

client.once('ready', () => {
  console.log(`🔥 Bot online como ${client.user.tag}`);
});

// 📌 painel
client.on('messageCreate', async (message) => {
  if (message.content === '!painel') {

    const embed = new EmbedBuilder()
      .setTitle('📮 Correio Elegante')
      .setDescription('Envie uma carta anônima ou identificada para alguém do servidor.')
      .setColor('#5865F2')
      .setFooter({ text: 'Clique no botão abaixo para começar' });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('abrir_painel')
        .setLabel('Enviar Carta')
        .setStyle(ButtonStyle.Primary)
    );

    message.channel.send({ embeds: [embed], components: [row] });
  }
});

// 🔘 interações
client.on(Events.InteractionCreate, async interaction => {

  // abrir painel
  if (interaction.isButton() && interaction.customId === 'abrir_painel') {

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('anonimo')
        .setLabel('Anônimo')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId('assinado')
        .setLabel('Assinado')
        .setStyle(ButtonStyle.Success)
    );

    return interaction.reply({
      content: 'Como deseja enviar?',
      components: [row],
      ephemeral: true
    });
  }

  // escolher tipo → abrir seletor de usuário
  if (interaction.isButton() && (interaction.customId === 'anonimo' || interaction.customId === 'assinado')) {

    const tipo = interaction.customId;

    const select = new UserSelectMenuBuilder()
      .setCustomId(`select_${tipo}`)
      .setPlaceholder('🔍 Selecione o destinatário');

    const row = new ActionRowBuilder().addComponents(select);

    return interaction.update({
      content: 'Escolha quem vai receber:',
      components: [row]
    });
  }

  // selecionar usuário → abrir modal
  if (interaction.isUserSelectMenu()) {

    const tipo = interaction.customId.split('_')[1];
    const userId = interaction.values[0];

    const modal = new ModalBuilder()
      .setCustomId(`modal_${tipo}_${userId}`)
      .setTitle('Escreva sua carta');

    const input = new TextInputBuilder()
      .setCustomId('mensagem')
      .setLabel('Sua mensagem')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(input)
    );

    return interaction.showModal(modal);
  }

  // envio final
  if (interaction.isModalSubmit()) {

    const [_, tipo, userId] = interaction.customId.split('_');
    const msg = interaction.fields.getTextInputValue('mensagem');

    const canal = client.channels.cache.get(CANAL_CARTAS);
    const log = client.channels.cache.get(CANAL_LOG);

    const user = await client.users.fetch(userId);

    const embed = new EmbedBuilder()
      .setDescription(msg)
      .setColor(tipo === 'anonimo' ? '#2b2d31' : '#57F287')
      .setTimestamp();

    if (tipo === 'anonimo') {
      embed.setAuthor({ name: '📨 Mensagem Anônima' });
    } else {
      embed.setAuthor({
        name: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL()
      });
    }

    // envia no canal
    canal.send({
      content: `📬 Carta para <@${user.id}>`,
      embeds: [embed]
    });

    // LOG ADMIN
    if (log) {
      const logEmbed = new EmbedBuilder()
        .setTitle('📜 Nova carta enviada')
        .addFields(
          { name: 'De', value: interaction.user.tag },
          { name: 'Para', value: `<@${user.id}>` },
          { name: 'Tipo', value: tipo },
          { name: 'Mensagem', value: msg }
        )
        .setColor('#ED4245')
        .setTimestamp();

      log.send({ embeds: [logEmbed] });
    }

    return interaction.reply({
      content: '✅ Carta enviada com sucesso!',
      ephemeral: true
    });
  }

});

client.login(process.env.TOKEN);
