import React from 'react';
import { Input } from '../common/Input';
import { AIData } from '@/types/inventory';

interface DynamicFieldsProps {
  aiData: AIData | null;
  formData: any;
  onFieldChange: (field: string, value: any) => void;
  category: string;
}

export const DynamicFields: React.FC<DynamicFieldsProps> = ({
  aiData,
  formData,
  onFieldChange,
  category,
}) => {
  if (!aiData) return null;

  const isElectronics = category === 'Electronics';
  const isMusicalInstrument = category === 'Musical Instruments';
  const isJewelry = category === 'Jewelry';
  const isTool = category === 'Tools';

  return (
    <div className="space-y-4">
      {/* Basic Information */}
      <div className="grid grid-cols-2 gap-4">
        {aiData.brand && (
          <Input
            label="Brand"
            value={formData.brand || aiData.brand}
            onChange={(e) => onFieldChange('brand', e.target.value)}
          />
        )}
        {aiData.model && (
          <Input
            label="Model"
            value={formData.model || aiData.model}
            onChange={(e) => onFieldChange('model', e.target.value)}
          />
        )}
        {aiData.year && (
          <Input
            label="Year"
            type="number"
            value={formData.year || aiData.year}
            onChange={(e) => onFieldChange('year', parseInt(e.target.value) || 0)}
          />
        )}
        {aiData.color && (
          <Input
            label="Color"
            value={formData.color || aiData.color}
            onChange={(e) => onFieldChange('color', e.target.value)}
          />
        )}
        {aiData.size && (
          <Input
            label="Size"
            value={formData.size || aiData.size}
            onChange={(e) => onFieldChange('size', e.target.value)}
          />
        )}
      </div>

      {/* Dimensions */}
      {aiData.dimensions && (
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Dimensions</label>
          <div className="grid grid-cols-4 gap-2">
            {aiData.dimensions.length && (
              <Input
                label="Length"
                value={formData.dimensions?.length || aiData.dimensions.length || ''}
                onChange={(e) => onFieldChange('dimensions', { ...(formData.dimensions || {}), length: e.target.value })}
              />
            )}
            {aiData.dimensions.width && (
              <Input
                label="Width"
                value={formData.dimensions?.width || aiData.dimensions.width || ''}
                onChange={(e) => onFieldChange('dimensions', { ...(formData.dimensions || {}), width: e.target.value })}
              />
            )}
            {aiData.dimensions.height && (
              <Input
                label="Height"
                value={formData.dimensions?.height || aiData.dimensions.height || ''}
                onChange={(e) => onFieldChange('dimensions', { ...(formData.dimensions || {}), height: e.target.value })}
              />
            )}
            {aiData.dimensions.weight && (
              <Input
                label="Weight"
                value={formData.dimensions?.weight || aiData.dimensions.weight || ''}
                onChange={(e) => onFieldChange('dimensions', { ...(formData.dimensions || {}), weight: e.target.value })}
              />
            )}
          </div>
        </div>
      )}

      {/* Electronics Specific Fields */}
      {isElectronics && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground">Technical Specifications</h4>
          <div className="grid grid-cols-2 gap-4">
            {aiData.operatingSystem && (
              <Input
                label="Operating System"
                value={formData.operatingSystem || aiData.operatingSystem}
                onChange={(e) => onFieldChange('operatingSystem', e.target.value)}
              />
            )}
            {aiData.processor && (
              <Input
                label="Processor"
                value={formData.processor || aiData.processor}
                onChange={(e) => onFieldChange('processor', e.target.value)}
              />
            )}
            {aiData.ram && (
              <Input
                label="RAM"
                value={formData.ram || aiData.ram}
                onChange={(e) => onFieldChange('ram', e.target.value)}
              />
            )}
            {aiData.storage && (
              <Input
                label="Storage"
                value={formData.storage || aiData.storage}
                onChange={(e) => onFieldChange('storage', e.target.value)}
              />
            )}
            {aiData.screenSize && (
              <Input
                label="Screen Size"
                value={formData.screenSize || aiData.screenSize}
                onChange={(e) => onFieldChange('screenSize', e.target.value)}
              />
            )}
            {aiData.resolution && (
              <Input
                label="Resolution"
                value={formData.resolution || aiData.resolution}
                onChange={(e) => onFieldChange('resolution', e.target.value)}
              />
            )}
            {aiData.batteryLife && (
              <Input
                label="Battery Life"
                value={formData.batteryLife || aiData.batteryLife}
                onChange={(e) => onFieldChange('batteryLife', e.target.value)}
              />
            )}
            {aiData.sensorSize && (
              <Input
                label="Sensor Size"
                value={formData.sensorSize || aiData.sensorSize}
                onChange={(e) => onFieldChange('sensorSize', e.target.value)}
              />
            )}
            {aiData.megapixels && (
              <Input
                label="Megapixels"
                value={formData.megapixels || aiData.megapixels}
                onChange={(e) => onFieldChange('megapixels', e.target.value)}
              />
            )}
            {aiData.videoResolution && (
              <Input
                label="Video Resolution"
                value={formData.videoResolution || aiData.videoResolution}
                onChange={(e) => onFieldChange('videoResolution', e.target.value)}
              />
            )}
          </div>
        </div>
      )}

      {/* Musical Instruments Specific */}
      {isMusicalInstrument && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground">Instrument Details</h4>
          <div className="grid grid-cols-2 gap-4">
            {aiData.instrumentType && (
              <Input
                label="Instrument Type"
                value={formData.instrumentType || aiData.instrumentType}
                onChange={(e) => onFieldChange('instrumentType', e.target.value)}
              />
            )}
            {aiData.numberOfStrings && (
              <Input
                label="Number of Strings"
                type="number"
                value={formData.numberOfStrings || aiData.numberOfStrings}
                onChange={(e) => onFieldChange('numberOfStrings', parseInt(e.target.value) || 0)}
              />
            )}
            {aiData.finish && (
              <Input
                label="Finish"
                value={formData.finish || aiData.finish}
                onChange={(e) => onFieldChange('finish', e.target.value)}
              />
            )}
          </div>
        </div>
      )}

      {/* Jewelry Specific */}
      {isJewelry && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground">Jewelry Details</h4>
          <div className="grid grid-cols-2 gap-4">
            {aiData.metalType && (
              <Input
                label="Metal Type"
                value={formData.metalType || aiData.metalType}
                onChange={(e) => onFieldChange('metalType', e.target.value)}
              />
            )}
            {aiData.stoneType && (
              <Input
                label="Stone Type"
                value={formData.stoneType || aiData.stoneType}
                onChange={(e) => onFieldChange('stoneType', e.target.value)}
              />
            )}
            {aiData.carat && (
              <Input
                label="Carat"
                value={formData.carat || aiData.carat}
                onChange={(e) => onFieldChange('carat', e.target.value)}
              />
            )}
          </div>
        </div>
      )}

      {/* Tools Specific */}
      {isTool && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground">Tool Specifications</h4>
          <div className="grid grid-cols-2 gap-4">
            {aiData.powerSource && (
              <Input
                label="Power Source"
                value={formData.powerSource || aiData.powerSource}
                onChange={(e) => onFieldChange('powerSource', e.target.value)}
              />
            )}
            {aiData.voltage && (
              <Input
                label="Voltage"
                value={formData.voltage || aiData.voltage}
                onChange={(e) => onFieldChange('voltage', e.target.value)}
              />
            )}
          </div>
        </div>
      )}

      {/* Additional Specifications */}
      {aiData.specifications && Object.keys(aiData.specifications).length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground mb-2">Additional Specifications</h4>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(aiData.specifications).map(([key, value]) => (
              <Input
                key={key}
                label={key}
                value={formData.specifications?.[key] || value}
                onChange={(e) => onFieldChange('specifications', {
                  ...formData.specifications,
                  [key]: e.target.value
                })}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

