import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import type { InteractionModule } from "../types";
import { get, users } from "../storage";

const module: InteractionModule<ChatInputCommandInteraction> = {
    data: new SlashCommandBuilder().setName("mine").setDescription("Mine some stones"),
    async execute(client, interaction) {
        if (!client.user) {
            await interaction.reply({
                content: "I don't know who I am.",
                ephemeral: true,
            });
            return;
        }

        const status = get("mine", (id) => ({
            id,
            last: 0,
        }));

        const now = Date.now();
        const diff = now - status[client.user.id].last;

        if (diff >= 10_000) {
            status[client.user.id] = {
                ...status[client.user.id],
                last: now,
            };

            const count = Math.floor(Math.random() * 40) + 10;
            const gold = Math.random() < 0.3;

            const u = users();
            u[interaction.user.id] = {
                ...u[interaction.user.id],
                exp: u[interaction.user.id].exp + count + (gold ? 100 : 0),
            };

            if (gold && u[interaction.user.id].backpack.items.length < u[interaction.user.id].backpack.size) {
                u[interaction.user.id].backpack.items.push({
                    id: "gold",
                    name: "Gold",
                    description: "A shiny piece of gold",
                    type: "misc",
                });
                u[interaction.user.id] = u[interaction.user.id];
            }

            const embed = new EmbedBuilder()
                .setTitle("You mined some stones!")
                .setDescription(`You mined ${count} stones.`)
                .addFields({ name: "Gold", value: gold ? "You also found a piece of gold!" : "You didn't find any gold this time." });

            await interaction.reply({ embeds: [embed] });
        } else {
            const left = Math.ceil((10_000 - diff) / 1000);
            const embed = new EmbedBuilder().setTitle("You can't mine yet!").setDescription(`You need to wait ${left} seconds.`);

            await interaction.reply({ embeds: [embed] });
        }
    },
};

export const data = module.data;
export const execute = module.execute;
