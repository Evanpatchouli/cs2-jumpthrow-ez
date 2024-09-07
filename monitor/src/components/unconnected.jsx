import { Color, Dom, Icon } from "evp-design-ui";

export default function UnConnected() {
  return (
    <>
      <Dom display="flex" gap={8} alignItems="center">
        <Icon name="warn" strokeWidth={4} radius={20} color={Color.Orange} />
        服务器未连接，请检查服务器状态
      </Dom>
    </>
  );
}
