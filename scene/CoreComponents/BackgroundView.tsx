import React from 'react';
import {Canvas, Image, useImage, Blur} from '@shopify/react-native-skia';
import {Dimensions, StyleProp, ViewStyle} from 'react-native';

interface MobileDimension{
  width: number;
  height: number;
}

function BackgroundView({ blur, style }: { blur: number, style?: StyleProp<ViewStyle> }) {
  const image = useImage(require('../../assets/main-bg.jpg'));
  const [dimension, _setDimension] = React.useState<MobileDimension>({
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  });
  if (!image) {
    return null;
  }

  return (
    <Canvas style={[{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -2}, style]}>
      <Image
        x={0}
        y={0}
        width={dimension.width}
        height={dimension.height}
        image={image}
        fit="cover">
        <Blur blur={blur} />
      </Image>
    </Canvas>
  );
}


export default BackgroundView;
