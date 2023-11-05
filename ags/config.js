import Hyprland from 'resource:///com/github/Aylur/ags/service/hyprland.js';
import SystemTray from 'resource:///com/github/Aylur/ags/service/systemtray.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import App from 'resource:///com/github/Aylur/ags/app.js';
import { subprocess, exec, execAsync } from 'resource:///com/github/Aylur/ags/utils.js';

const Workspaces = () => Widget.Box({
    className: 'workspaces',
    connections: [[Hyprland.active.workspace, self => {
        // array [1..10]
        const arr = Array.from({ length: 10 }, (_, i) => i + 1);
        self.children = arr.map(i => Widget.Button({
            onClicked: () => execAsync(`hyprctl dispatch workspace ${i}`),
            child: Widget.Label(`${i}`),
            className: Hyprland.active.workspace.id == i ? 'focused' : '',
        }));
    }]],
});

const ClientTitle = () => Widget.Label({
    className: 'client-title',
    binds: [
        ['label', Hyprland.active.client, 'title'],
    ]
})

const SysTray = () => Widget.Box({
    connections: [
        [SystemTray, self => {
            self.children = SystemTray.items.map(item => Widget.Button({
                child: Widget.Icon({ binds: [['icon', item, 'icon']] }),
                onPrimaryClick: (_, event) => item.activate(event),
                onSecondaryClick: (_, event) => item.openMenu(event),
                binds: [['tooltip-markup', item, 'tooltip-markup']],
            }));
        }],
    ],
});

const Clock = () => Widget.Label({
    className: 'clock',
    connections: [
        [1000, self => execAsync(['date', '+%H:%M:%S %b %e'])
            .then(date => self.label = date).catch(console.error)]
    ]
});

const Left = () => Widget.Box({
    children: [
        Workspaces(),
    ],
});

const Center = () => Widget.Box({
    children: [
        ClientTitle(),
    ],
});

const Right = () => Widget.Box({
    halign: 'end',
    children: [
        SysTray(),
        Clock(),
    ],
});

const Bar = ({ monitor } = {}) => Widget.Window({
    name: `bar-${monitor}`,
    className: 'bar',
    monitor,
    anchor: ['top', 'left', 'right'],
    exclusive: true,
    child: Widget.CenterBox({
        startWidget: Left(),
        centerWidget: Center(),
        endWidget: Right(),
    }),
});

export default {
    style: `${App.configDir}/style.css`,
    windows: [
        Bar(),
    ]
};

subprocess([
    'inotifywait',
    '--recursive',
    '--event', 'create,modify',
    '-m', `${App.configDir}/style.scss`,
], () => {
    const scss = `${App.configDir}/style.scss`;
    const css = `${App.configDir}/style.css`;
    exec(`sassc ${scss} ${css}`);
    App.resetCss();
    App.applyCss(css);
});